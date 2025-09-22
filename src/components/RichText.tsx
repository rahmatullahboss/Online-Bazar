import React, { ReactNode } from 'react'

interface RichTextProps {
  content: any
}

const RichText: React.FC<RichTextProps> = ({ content }) => {
  if (!content) return null

  // Debug: Log content structure in development
  if (process.env.NODE_ENV === 'development') {
    console.log('RichText content:', JSON.stringify(content, null, 2))
  }

  // Handle the new Payload content structure
  const renderContent = (contentData: any) => {
    // If content has a root property (new Payload structure)
    if (contentData && contentData.root && Array.isArray(contentData.root.children)) {
      return contentData.root.children.map((node: any, index: number) => {
        return renderNode(node, index)
      })
    }

    // If content is an array (old structure)
    if (Array.isArray(contentData)) {
      return contentData.map((node, index) => {
        return renderNode(node, index)
      })
    }

    // If content is a string
    if (typeof contentData === 'string') {
      return <p>{contentData}</p>
    }

    return null
  }

  const renderNode = (node: any, index: number): ReactNode => {
    if (typeof node === 'string') {
      return <p key={index}>{node}</p>
    }

    if (typeof node === 'object' && node !== null) {
      switch (node.type) {
        case 'heading':
          const headingLevel = node?.tag ? parseInt(node.tag.replace('h', '')) : 1
          const headingTag = `h${headingLevel}`
          const headingClasses = `${
            headingLevel === 1
              ? 'text-3xl font-bold mt-6 mb-4'
              : headingLevel === 2
                ? 'text-2xl font-bold mt-5 mb-3'
                : headingLevel === 3
                  ? 'text-xl font-bold mt-4 mb-2'
                  : headingLevel === 4
                    ? 'text-lg font-bold mt-3 mb-2'
                    : headingLevel === 5
                      ? 'text-base font-bold mt-3 mb-1'
                      : 'text-sm font-bold mt-3 mb-1'
          }`
          return React.createElement(
            headingTag,
            { key: index, className: headingClasses },
            renderChildren(node.children),
          )
        case 'paragraph':
          return React.createElement(
            'p',
            { key: index, className: 'mb-4' },
            renderChildren(node.children),
          )
        case 'list':
          const listTag = node?.listType === 'number' ? 'ol' : 'ul'
          const listClasses =
            node?.listType === 'number' ? 'list-decimal pl-5 mb-4' : 'list-disc pl-5 mb-4'
          return React.createElement(
            listTag,
            { key: index, className: listClasses },
            renderChildren(node.children),
          )
        case 'listitem':
          return React.createElement(
            'li',
            { key: index, className: 'mb-1' },
            renderChildren(node.children),
          )
        case 'link':
          return React.createElement(
            'a',
            {
              key: index,
              href: node.fields?.url || node.url,
              target: node.fields?.newTab || node.newTab ? '_blank' : '_self',
              rel: 'noopener noreferrer',
              className: 'text-blue-600 hover:text-blue-800 underline',
            },
            renderChildren(node.children),
          )
        case 'relationship':
          // Handle relationship nodes if needed
          return null
        case 'upload':
          // Handle upload nodes if needed
          return null
        default:
          // Handle unknown node types by rendering their text content
          if (node.text) {
            return React.createElement('p', { key: index }, renderChildren([node]))
          }
          if (node.children) {
            return React.createElement('p', { key: index }, renderChildren(node.children))
          }
          return null
      }
    }

    return null
  }

  const renderChildren = (children: any): ReactNode => {
    if (!children) return null

    return Array.isArray(children)
      ? children.map((child, index) => {
          if (typeof child === 'string') {
            return child
          }

          if (typeof child === 'object' && child !== null) {
            if (child.bold) {
              return React.createElement('strong', { key: index }, child.text)
            }
            if (child.italic) {
              return React.createElement('em', { key: index }, child.text)
            }
            if (child.underline) {
              return React.createElement('u', { key: index }, child.text)
            }
            if (child.strikethrough) {
              return React.createElement('s', { key: index }, child.text)
            }
            if (child.code) {
              return React.createElement(
                'code',
                { key: index, className: 'bg-gray-100 px-1 py-0.5 rounded' },
                child.text,
              )
            }
            // Handle plain text objects
            if (child.text) {
              return child.text
            }
            // Recursively render child nodes
            if (child.children) {
              return renderChildren(child.children)
            }
            return ''
          }

          return child
        })
      : children
  }

  return React.createElement('div', { className: 'prose max-w-none' }, renderContent(content))
}

export default RichText
