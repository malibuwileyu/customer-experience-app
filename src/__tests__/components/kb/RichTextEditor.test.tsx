import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RichTextEditor } from '@/components/kb/RichTextEditor'

describe('RichTextEditor', () => {
  const defaultProps = {
    value: '',
    onChange: () => {},
    placeholder: 'Start typing...',
    'aria-label': 'content'
  }

  it('should render the editor', () => {
    render(<RichTextEditor {...defaultProps} />)
    expect(screen.getByRole('textbox', { name: /content/i })).toBeInTheDocument()
  })

  it('should render with initial content', () => {
    render(<RichTextEditor {...defaultProps} value="<p>Initial content</p>" />)
    const editor = screen.getByRole('textbox', { name: /content/i })
    expect(editor).toHaveTextContent('Initial content')
  })

  it('should render toolbar with basic formatting options', () => {
    render(<RichTextEditor {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bullet list/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /numbered list/i })).toBeInTheDocument()
  })

  it('should show placeholder when empty', () => {
    render(<RichTextEditor {...defaultProps} placeholder="Type something..." />)
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument()
  })

  it('should be disabled when readonly', () => {
    render(<RichTextEditor {...defaultProps} readOnly />)
    const editor = screen.getByRole('textbox', { name: /content/i })
    expect(editor).toHaveAttribute('contenteditable', 'false')
  })
}) 