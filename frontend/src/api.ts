import { getCookie, removeCookie } from "./utils";
import axios, { AxiosResponse } from "axios";
import { HTTP_STATUS_CODES } from './errors'
import { Queue } from './utils';
import { responseCall, responseCallError, requestCall } from "./blocking";
import JsFileDownloader from 'js-file-downloader';

export const queue = new Queue();

interface Params {
    route: string;
    session?: Object,
    args?: Array<any>;
    kwargs?: Object;
}
const api = axios.create({
    timeout: 100000,
})
export type Response = AxiosResponse;
api.defaults.headers.post['Content-Type'] = 'application/json';
api.defaults.headers.put['Content-Type'] = 'application/json';

api.interceptors.request.use(config => {
    let token = getCookie('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    requestCall();
    return config
}, error => {
    return Promise.reject(error)
})

api.interceptors.response.use((response) => {
    responseCall();
    return response
}, (error) => {
    responseCallError();
    let code = error.response.status;
    let message = HTTP_STATUS_CODES[code];
    return Promise.reject({ error, message });
});


function params(params: { [key: string]: any }) {
    return Object.keys(params).map(key => key + '=' + params[key]).join('&');
}

export const post = (url: string, data: any, config = {}) => {
    return new Promise<AxiosResponse>((resolve, reject) => {
        api({
            method: 'post',
            url,
            data,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export const put = (url: string, data: any, config = {}) => {
    return new Promise<AxiosResponse>((resolve, reject) => {
        api({
            method: 'put',
            url,
            data,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}
export const get = (url: string) => {
    return new Promise<AxiosResponse>((resolve, reject) => {
        api({
            method: 'get',
            url
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}


export const remove = (url: string) => {
    return new Promise<AxiosResponse>((resolve, reject) => {
        api({
            method: 'delete',
            url
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export const logIn = (username: string, password: string) => {
    let data = { username, password };
    return post('/api/login', data);
}
export const getUserInfo = (accessToken: boolean = true) => {
    if (accessToken) {
        return get('/api/user_info');
    } else {
        return get('/api/user_info?no_access_token=1');
    }

}
export const saveUser = (data: { [key: string]: any } = {}) => {
    return put('/api/user_info', data);
}

export const getPosts = (limit: number = 20, offset: number = 0) => {
    let data = { limit, offset };
    let s = params(data)
    return get(`/api/posts?${s} `)
}

export const getPost = (postId: string) => {
    return get(`/api/posts/${postId}`)
}

export const createPost = (data: { [key: string]: any }) => {
    return post('/api/posts', data)
}

export const updatePost = (postId: string, data: { [key: string]: any }) => {
    return put(`/api/posts/${postId}`, data)
}

export const follow = (userId: string) => {
    return put(`/api/users/${userId}/followers`, {})
}

export const unfollow = (userId: string) => {
    return put(`/api/users/${userId}/followed`, {})
}

export const updateClaps = (postId: string, data: { [key: string]: any } = {}) => {
    return put(`/api/posts/${postId}/clap`, data)
}

export const getDraftPosts = (data: { [key: string]: any }) => {
    const { page, pageSize: per_page } = data;
    return get(`/api/posts/draft?page=${page}&per_page=${per_page}`);
}

export const getPushlishedPosts = (data: { [key: string]: any }) => {
    const { page, pageSize: per_page } = data;
    return get(`/api/posts/published?page=${page}&per_page=${per_page}`);
}

export const removePost = (postId: string) => {
    return remove(`/api/posts/${postId}`);
}

export const searchPost = (data: { [key: string]: any }) => {
    return get(`/api/posts/search?value=${data.value}&page=${data.page}&per_page${data.per_page}`);
}

export const publishPost = (id: string) => {
    return put(`/api/posts/${id}/publish`, {});
}


export const draftPost = (id: string) => {
    return put(`/api/posts/${id}/draft`, {});
}

export const logOut = () => {
    return post('/api/logout', {}).then(() => {
        removeCookie('access_token');
    });
}

export const sendVerificationCode = (data: { [key: string]: any }) => {
    return post('/api/verification_code', data);
}

export const signUp = (data: { [key: string]: any }) => {
    return post('/api/signup', data);
}

export const getTrendingStories = () => {
    return get('/api/posts/trending');
}

export const postComment = (data: { [key: string]: any }) => {
    return post('/api/comments', data);
};

export const getComments = (data: { [key: string]: any }) => {
    const { id } = data;
    return get(`/api/comments?post_id=${id}`);
}

export const getTags = (postId: string) => {
    return get(`/api/tags?post_id=${postId}`);
}

export const getOrCreateTag = (text: string, postId: string) => {
    return post(`/api/tags`, { name: text, post_id: postId });
}

export const unlinkTag = (tagId: string, postId: string) => {
    return put(`/api/tags`, { post_id: postId, tag_id: tagId });
}

export const getFile = (url: string) => {
    let token = getCookie('access_token');
    return new JsFileDownloader({
        url,
        headers: [
            { name: 'Authorization', value: `Bearer ${token}` }
        ]
    })

}
export const getMessages =  (offset: number = 0, limit: number = 100) => {
    return get(`/api/messages?offset=${offset}&limit=${limit}`);
}

export const markMessageAsRead = (id: string) => {
    return put(`/api/messages/${id}/mark_as_read`, {});
}

export const messageRemove= (id: string) => {
    return remove(`/api/messages/${id}`);
}