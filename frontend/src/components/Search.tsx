import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
interface Props {
    placeholder? :string;
    className?: string;
}

const Search: React.FC<Props> = (props) => {
    const history = useHistory();
    const [value, setValue] = useState('');
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setValue(value);
        history.push(`/expore/search?value=${value}`);
    };
    return  (<div className={`search-box-container ${props.className}`}>
    <div className="search-box">
        <a href="#" className="search-btn">
            <i className="fa fa-search"></i>
        </a>
        <input  className="search-txt" type="text" onChange={onChange}
            placeholder={props.placeholder || 'Search'}/>
    </div>
</div>)
}
export default Search;
