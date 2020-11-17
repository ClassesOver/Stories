import AppContext from './context';
import React, {useContext} from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import {useToasts} from 'react-toast-notifications';
interface  IPrivateRouteProps extends RouteProps {
}

const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
    const { addToast } = useToasts();
    const {children, ...extraProps} = props;
    const {authenticated} = useContext(AppContext);
    return (<Route {...extraProps}  render={ (props:any) =>
        {
            return authenticated.userId ? (
                children
            ) : (   <>
                    {
                        addToast('Unauthorized', {
                            appearance: 'error',
                            autoDismiss: true,
                          })
                    }
                    <Redirect to={{ pathname: "/", state: { from: props.location } }} />
                    </>
                );
        }
    } />);
};

export default PrivateRoute
