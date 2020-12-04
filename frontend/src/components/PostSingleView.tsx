import React, {useEffect, useState} from 'react';
import MarkdownPreview from "./MarkdownPreview";
import {useParams} from 'react-router-dom';
import Profile from "./Profile";
import * as api from '../api';
import Comments from './Comments'
import ClapButton from './ClapButton';
interface IPostViewProps {

}
interface IParams  {
  postId: string;
}

const PostView: React.FC<IPostViewProps> = (props) => {
    const {postId} = useParams<IParams>();
    const [post, setPost] = useState<{[key: string]:any}>({});
    useEffect(() => {
      if (postId) {
        fetchPost(postId as string);
      }
    }, []);
    const fetchPost = async (postId: string) => {
      let resp = await api.getPost(postId);
      setPost({...post, ...resp.data});
      return resp;
    }

    return <div className="tm-single-post-view-container">
            {post.author ? <Profile author={post.author} isFollowing={post.is_following}/> : <></>}
            <div className="tm-single-post-view">  
              <div className="tm-single-post">
                <div className="tm-single-groud ">
                  <MarkdownPreview className="markdown-body" value={post.body} /> 
                  <div className='tags'>
                    {
                      post.id ? post.tags.map((v: { [key: string]: any, name: string, id: string }) => {
                        return <span className="tag" data-id={v.id} >{v.name}</span>
                      }) : ''
                    }
                  </div>
                </div>
                <Comments postId={post.id} pageSize={10} />
                <div className="actions">
                    <ClapButton clapCount={post.clap_count} postId={post.id}/>
                </div>
              </div>
            </div>
    </div>
}

export default PostView;