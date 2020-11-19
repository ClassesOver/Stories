import React, { useEffect, useState } from 'react';
import {useRouteMatch, useLocation} from 'react-router-dom';
import MarkdownPreview from './MarkdownPreview';
import Moment from 'react-moment';
import * as api from '../api';
interface ISearchViewProps {

};

const SearchView: React.FC<ISearchViewProps> = (props) => {
    const {search} = useLocation();
    let params = new URLSearchParams(search);
    let value = params.get('value');
    let [page, setPage] = useState(1);
    const per_page = 20;
    const [items, setItems] = useState<{ [key: string]: any} []>([]);
    const fetch = async () => {
        if (value) {
            let resp = await api.searchPost({value, per_page, page});
            setItems(resp.data.items);
        }
    };
    useEffect(() => {
        fetch();
    }, []);
     useEffect(() => {
        fetch();
    }, [search]);
    return <div className="tm-search-view">
        {
            items.map((item) => {
                let content = '';
                let extra = false;
                if (item.body && item.body.length > 200) {
                    content = item.body.slice(0, 200);
                    extra = true;
                } else {
                    content = item.body;
                }
                return <div key={item.id} className="tm-search-view-item">
                    <div>
                        <h3>{item.title}</h3>
                        <MarkdownPreview className="markdown-body" value={extra ? content + '...' : content} />
                        <Moment format="LL" >{item.timestamp}</Moment>
                    </div>
                </div>
            })
        }
    </div>
}

export default SearchView;