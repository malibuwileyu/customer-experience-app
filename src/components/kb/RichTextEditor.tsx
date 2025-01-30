import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '../../components/common/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  'aria-label'?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  readOnly = false,
  'aria-label': ariaLabel = 'Rich text editor'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        'aria-label': ariaLabel,
        role: 'textbox'
      }
    }
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="bold"
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          B
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="italic"
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          I
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="bullet list"
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          •
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="numbered list"
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          1.
        </Button>
      </div>
      
      <div className="p-4 h-full overflow-y-auto cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
          className="h-full prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none"
        />
      </div>
    </div>
  )
} 