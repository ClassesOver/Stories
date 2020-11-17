import React, {ComponentType} from 'react';

interface WithLoadingProps {
    loading: boolean;
}

const withLoading = <P extends object>(Component: ComponentType<P>) => {
    return class extends React.Component<P & WithLoadingProps> {
        render() {
            const {loading, ...props} = this.props;
            return loading ? 'loading' : <Component {...props as P} />;
        }
    }

}

export  default withLoading;