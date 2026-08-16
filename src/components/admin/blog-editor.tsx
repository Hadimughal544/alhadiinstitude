"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
  Loader2,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { slugifyBlog } from "@/lib/blog-slug";
import {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/actions";
import { toActionError } from "@/lib/action-result";

type BlogEditorProps = {
  mode: "create" | "edit";
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    attachmentUrl: string | null;
    attachmentName: string | null;
    attachmentType: string | null;
    status: "DRAFT" | "PUBLISHED";
    metaTitle: string | null;
    metaDescription: string | null;
  };
  onSuccess?: () => void;
};

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json()) as {
    url?: string;
    error?: string;
    attachmentType?: string;
    originalFilename?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Upload failed");
  }
  return data;
}

export function BlogEditor({ mode, post, onSuccess }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(post?.attachmentUrl ?? "");
  const [attachmentName, setAttachmentName] = useState(post?.attachmentName ?? "");
  const [attachmentType, setAttachmentType] = useState(post?.attachmentType ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(post?.status ?? "DRAFT");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: "Write your blog post…",
      }),
    ],
    content: post?.content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-blog min-h-[280px] max-w-none px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      setContentHtml(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyBlog(title));
    }
  }, [title, slugTouched]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const onCoverFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploadingCover(true);
    try {
      const data = await uploadFile(file);
      setCoverImage(data.url!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cover upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const onInlineFile = async (file: File | undefined) => {
    if (!file || !editor) return;
    setError(null);
    setUploadingInline(true);
    try {
      const data = await uploadFile(file);
      editor.chain().focus().setImage({ src: data.url!, alt: title || "Blog image" }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingInline(false);
    }
  };

  const onDocFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploadingDoc(true);
    try {
      const data = await uploadFile(file);
      setAttachmentUrl(data.url!);
      setAttachmentName(data.originalFilename || file.name);
      setAttachmentType(data.attachmentType || "pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Document upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  const submit = (formData: FormData) => {
    setError(null);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("excerpt", excerpt);
    formData.set("content", contentHtml || editor?.getHTML() || "");
    formData.set("coverImage", coverImage);
    formData.set("attachmentUrl", attachmentUrl);
    formData.set("attachmentName", attachmentName);
    formData.set("attachmentType", attachmentType);
    formData.set("status", status);
    formData.set("metaTitle", metaTitle);
    formData.set("metaDescription", metaDescription);
    if (mode === "edit" && post) {
      formData.set("id", post.id);
    }

    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createBlogPostAction(formData)
            : await updateBlogPostAction(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSuccess?.();
      } catch (e) {
        setError(toActionError(e, "Save failed"));
      }
    });
  };

  const onDelete = () => {
    if (!post || !window.confirm("Delete this blog post permanently?")) return;
    startTransition(async () => {
      try {
        const result = await deleteBlogPostAction(post.id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSuccess?.();
      } catch (e) {
        setError(toActionError(e, "Delete failed"));
      }
    });
  };

  return (
    <form action={submit} className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
            placeholder="Post title"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 font-mono text-sm"
            placeholder="url-slug"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Excerpt</span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2"
            placeholder="Short summary for the blog list and SEO"
          />
        </label>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium">Cover image</span>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={uploadingCover}
            onClick={() => coverInputRef.current?.click()}
            className="gap-2"
          >
            {uploadingCover ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload cover
          </Button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onCoverFile(e.target.files?.[0])}
          />
          {coverImage && (
            <button
              type="button"
              onClick={() => setCoverImage("")}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          )}
        </div>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt="Cover preview"
            className="max-h-48 w-full rounded-2xl border border-foreground/10 object-cover"
          />
        )}
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium">PDF or Word attachment (optional)</span>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={uploadingDoc}
            onClick={() => docInputRef.current?.click()}
            className="gap-2"
          >
            {uploadingDoc ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Upload PDF / Word
          </Button>
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => onDocFile(e.target.files?.[0])}
          />
          {attachmentUrl && (
            <button
              type="button"
              onClick={() => {
                setAttachmentUrl("");
                setAttachmentName("");
                setAttachmentType("");
              }}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          )}
        </div>
        {attachmentUrl && (
          <p className="rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm text-muted">
            {attachmentName || "Attached file"}
            {attachmentType ? ` · ${attachmentType.toUpperCase()}` : ""}
          </p>
        )}
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Content</span>
        <div className="overflow-hidden rounded-2xl border border-foreground/15 bg-background">
          <div className="flex flex-wrap gap-1 border-b border-foreground/10 bg-card px-2 py-2">
            <ToolbarButton
              active={editor?.isActive("bold")}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              label="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor?.isActive("italic")}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              label="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor?.isActive("heading", { level: 2 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              label="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor?.isActive("heading", { level: 3 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              label="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor?.isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              label="Bullet list"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor?.isActive("orderedList")}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              label="Ordered list"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor?.isActive("blockquote")}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              label="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor?.isActive("link")} onClick={setLink} label="Link">
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => inlineInputRef.current?.click()}
              label="Insert image"
              disabled={uploadingInline}
            >
              {uploadingInline ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
            </ToolbarButton>
            <input
              ref={inlineInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onInlineFile(e.target.files?.[0])}
            />
            <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} label="Undo">
              <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} label="Redo">
              <Redo2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">SEO title (optional)</span>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
            placeholder="Defaults to post title"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">SEO description (optional)</span>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2"
            placeholder="Defaults to excerpt"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || !title.trim() || !slug.trim()}>
          {pending ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="outline" disabled={pending} onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-50",
        active && "bg-teal/15 text-teal dark:bg-gold/20 dark:text-gold"
      )}
    >
      {children}
    </button>
  );
}
