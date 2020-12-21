import React, {useEffect, useState} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
interface Props {
    placeholder? :string;
    className?: string;
}

const Search: React.FC<Props> = (props) => {
    const history = useHistory();
    const {search, pathname} = useLocation();
    let params = new URLSearchParams(search);
    let searchValue = params.get('value');
    const [value, setValue] = useState(searchValue);
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setValue(value);
        if (value) {
            event.target.classList.add('active');
        } else {
            event.target.classList.remove('active');
        }
        history.push(`/expore/search?value=${value}`);
    };
    useEffect(() => {

        if (pathname !== '/expore/search') {
            setValue('');
        } else {
            setValue(searchValue);
        }
    }, [pathname]);
    return  (<div className={`search-box-container ${props.className}`}>
    <div className="search-box">
        <a href="#" className="search-btn">
            <i className="fa fa-search"></i>
        </a>
        <input  className={value ? 'search-txt active' : 'search-txt'} type="text" onChange={onChange}
            value={value as any}   placeholder={props.placeholder || 'Search'}/>
    </div>
</div>)
}
export default Search;
