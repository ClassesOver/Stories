import React, { useEffect, useState } from 'react';
import {useRouteMatch, useLocation} from 'react-router-dom';
import * as api from '../api';
interface ISearchViewProps {

};

const SearchView: React.FC<ISearchViewProps> = (props) => {
    const {search} = useLocation();
    let params = new URLSearchParams(search);
    let value = params.get('value');
    let [page, setPage] = useState(1);
    const per_page = 20;
    const [items, setItems] = useState([]);
    const fetch = async () => {
        if (value) {
            let resp = await api.searchPost({value, per_page, page});
            setItems(resp.data);
        }
    };
    useEffect(() => {
        fetch();
    }, []);
    return <div className="tm-search-view">
        {
            items.map((item) => {
                return <div className="tm-search-view-item"></div>
            })
        }
    </div>
}

export default SearchView;