import React, { useEffect, useRef, useState } from "react";
import * as api from '../api';
interface IClapButtonProps {
    postId: string; 
    clapCount: number;
}

const ClapButton: React.FC<IClapButtonProps> = (props) => {
    const ref = useRef<HTMLSpanElement>(null);
    const refCounting = useRef<HTMLSpanElement>(null);
    const {postId, clapCount} = props;
    const [totalCount, setTotalCount] = useState(0);
    const [count, setCount] = useState(0);
    const updateClaps = async() => {
        if (postId) {
            let resp = await api.updateClaps(props.postId);
            let {clap_count} = resp.data;
            setTotalCount(clap_count);
            return resp;
        }
    }
    useEffect(() => {
        updateClaps();
    }, [count]);
    useEffect(() => {
        setTotalCount(clapCount);
    }, [clapCount])
    
    const onClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        let node = ref.current;
        let nodeCounting = refCounting.current;
        setCount(count + 1)
        if (node !== null) {
            node.classList.add('clap-active')
            setTimeout(() => {
                if (node !== null) {
                    node.classList.remove('clap-active')
                }
            }, 400)
        }
        if (nodeCounting !== null) {
            nodeCounting.classList.add('counting')
            setTimeout(() => {
                if (nodeCounting !== null) {
                    nodeCounting.classList.remove('counting')
                }
            }, 300)
        }
    }
    return <div className="clap-container">
        <span ref={refCounting} className="count">+{count}</span>
        <span ref={ref} onClick={onClick} className="clap-btn"></span><span className="total-count">{totalCount || 0}</span>
    </div>
}
export default ClapButton;