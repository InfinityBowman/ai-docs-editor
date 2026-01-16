import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

function Preview({ content }) {
  const containerRef = useRef(null);

  // Restore scroll position after content loads/updates
  useEffect(() => {
    if (content) {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition) {
        // Use requestAnimationFrame to wait for DOM to update
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        });
      }
    }
  }, [content]);

  // Save scroll position before unload (for manual page refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="markdown-body" ref={containerRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default Preview;
