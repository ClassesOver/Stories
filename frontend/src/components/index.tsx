import Nav from './Nav';
import React, {useEffect, useContext} from "react";
import {Switch, Route, useRouteMatch, Redirect, useLocation} from 'react-router-dom';
import PostsView from './Posts';
import PostEditorView from './PostEditer';
import SearchView from './SearchView';
import  PrivateRoute from "../route";
import { toastError } from '../errors';
import PostSingleView from './PostSingleView';
import Stories from './Stories';
import AppContext from '../context';
import SignUp from './SignUp';
import SignIn from './SignIn';
interface Props {
};

const AppLayout: React.FC<any> = () => {
    let { path} = useRouteMatch();
    const location = useLocation();
    const {authenticated} = useContext(AppContext);
    useEffect(() => {
        let {errorCode} =location.state as any || {};
        if (errorCode) {
            toastError(errorCode);
        }
    },[location])
    return <div className="layout">
        <Switch>
            <Route exact path={`${path}`}>
                <PostsView  />
            </Route>
            <Route exact path={`${path}/editor`}>
                <Redirect to={`${path}/editor/new`} />
            </Route>
            <Route path={`${path}/search`}>
                <SearchView />
            </Route>
            <PrivateRoute path={`${path}/editor/:postId`}>
                <PostEditorView />
            </PrivateRoute>
            <Route exact path={`${path}/view/:postId`}>
                <PostSingleView />
            </Route>
            <PrivateRoute path={`${path}/me/stories`}>
                <Stories userId={authenticated.userId} />
            </PrivateRoute>
        </Switch>

    </div>
}
export {
    Nav,
    AppLayout,
    Stories,
    SignUp,
    SignIn,
}