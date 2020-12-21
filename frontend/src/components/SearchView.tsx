import React, { useEffect, useState } from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import MarkdownPreview from './MarkdownPreview';
import Moment from 'react-moment';
import * as api from '../api';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
interface ISearchViewProps {

};
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '30px',
      height: '30px',
      marginRight: '5px'
    },
  }),
);


const SearchView: React.FC<ISearchViewProps> = (props) => {
    const {search} = useLocation();
    const classes = useStyles();
    const history = useHistory();
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
    const handleViewPost = (event: React.MouseEvent<HTMLElement>) => {
        let target = event.target as HTMLElement;
        history.push(`/expore/view/${target.dataset.id}`, {});
    }
    return (<div className="tm-search-view">
        <PerfectScrollbar>
            <div className="tm-posts">
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
                        return (<div key={item.id} onClick={handleViewPost}  data-id={item.id} className="tm-search-piece tm-post-piece">
                            <h6 data-id={item.id} ><Avatar src={item.author._links.avatar} className={classes.root} alt={item.author.username}>{item.author.username && item.author.username[0]}
                            </Avatar><Moment format="LL" >{item.timestamp}</Moment></h6>
                            <MarkdownPreview className="markdown-body" value={extra ? content + '...' : content} />
                        </div>)
                    })
                }
            </div>
        </PerfectScrollbar>
    </div>)

}

export default SearchView;