"use client";

import { useCallback, useRef, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label, Field } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { slugifyBlog } from "@/lib/blog-slug";
import {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/actions";
import { toActionError } from "@/lib/action-result";
import { useServerAction } from "@/hooks/use-server-action";

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
  const effectiveSlug = slugTouched ? slug : slugifyBlog(title);
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const {
    run: runSave,
    pending: savePending,
    error: saveError,
  } = useServerAction(mode === "create" ? createBlogPostAction : updateBlogPostAction);
  const pending = savePending || deletePending;
  const error = saveError || deleteError || uploadError;
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
    setUploadError(null);
    setUploadingCover(true);
    try {
      const data = await uploadFile(file);
      setCoverImage(data.url!);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Cover upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const onInlineFile = async (file: File | undefined) => {
    if (!file || !editor) return;
    setUploadError(null);
    setUploadingInline(true);
    try {
      const data = await uploadFile(file);
      editor.chain().focus().setImage({ src: data.url!, alt: title || "Blog image" }).run();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingInline(false);
    }
  };

  const onDocFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploadingDoc(true);
    try {
      const data = await uploadFile(file);
      setAttachmentUrl(data.url!);
      setAttachmentName(data.originalFilename || file.name);
      setAttachmentType(data.attachmentType || "pdf");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Document upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  const submit = (formData: FormData) => {
    setUploadError(null);
    setDeleteError(null);
    formData.set("title", title);
    formData.set("slug", effectiveSlug);
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

    runSave(formData, () => onSuccess?.());
  };

  const onDelete = () => {
    if (!post) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        const result = await deleteBlogPostAction(post.id);
        if (!result.ok) {
          setDeleteError(result.error);
          return;
        }
        setConfirmDeleteOpen(false);
        onSuccess?.();
      } catch (e) {
        setDeleteError(toActionError(e, "Delete failed"));
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
        <Field className="sm:col-span-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Post title"
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="blog-slug">Slug</Label>
          <Input
            id="blog-slug"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className="font-mono text-sm"
            placeholder="url-slug"
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="blog-excerpt">Excerpt</Label>
          <Textarea
            id="blog-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Short summary for the blog list and SEO"
          />
        </Field>
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCoverImage("")}
              className="gap-1 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" /> Remove
            </Button>
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAttachmentUrl("");
                setAttachmentName("");
                setAttachmentType("");
              }}
              className="gap-1 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" /> Remove
            </Button>
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
        <Field>
          <Label htmlFor="blog-status">Status</Label>
          <Select
            id="blog-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </Field>
        <Field>
          <Label htmlFor="blog-meta-title">SEO title (optional)</Label>
          <Input
            id="blog-meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Defaults to post title"
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="blog-meta-description">SEO description (optional)</Label>
          <Textarea
            id="blog-meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            placeholder="Defaults to excerpt"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || !title.trim() || !effectiveSlug.trim()}>
          {pending ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setConfirmDeleteOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>

      {mode === "edit" && post && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Delete this blog post?"
          description="This will permanently delete the blog post. This action cannot be undone."
          confirmLabel="Delete"
          pending={deletePending}
          onConfirm={onDelete}
        />
      )}
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
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-8 w-8",
        active && "bg-teal/15 text-teal dark:bg-gold/20 dark:text-gold"
      )}
    >
      {children}
    </Button>
  );
}
