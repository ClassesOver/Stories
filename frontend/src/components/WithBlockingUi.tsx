import React, {ComponentType, useContext, useEffect} from 'react';
import AppContext from '../context'
interface WithBlockUiProps {
    loading: boolean;
}

const withBlockingUi = <P extends object>(Component: ComponentType<P>) => {
    return (props: P & WithBlockUiProps) => {
        const {loading, ...extrProps} = props;
        const {setBlock} = useContext(AppContext);
        useEffect(() => {
            setBlock(loading);
        },[props.loading]);
        return <Component {...extrProps as P} />
    }
}

export  default withBlockingUi;