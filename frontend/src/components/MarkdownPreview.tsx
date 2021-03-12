import React from 'react';
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';
import {InlineMath, BlockMath} from 'react-katex';
import math from 'remark-math';
import 'katex/dist/katex.min.css';
import { CodeBlock,  tomorrowNight} from "react-code-blocks";
import emoji from "remark-emoji";
import slug from "remark-slug";

interface IMarkdownProps {
    value: string;
    className?: string;
}

const renderers = {
    inlineMath: ({value}: any) => <InlineMath math={value} />,
    math: ({value}: any) => <BlockMath math={value} />,
    code: ({language, value}: any) => {
      return  <CodeBlock
                text={value || ''}
                language={language}
                showLineNumbers
                wrapLines={false}
                theme={tomorrowNight}
                />
    },
  }

const MarkdownPreview: React.FC<any> = (props) => {
    return ( <div style={props.style} className={`${props.className}`}>
                <ReactMarkdown renderers={renderers}  allowDangerousHtml
                    plugins={[
                        [emoji], [gfm], [math], 
                        [slug]]} >{props.value}</ReactMarkdown>
            </div>)
}
export default MarkdownPreview;
