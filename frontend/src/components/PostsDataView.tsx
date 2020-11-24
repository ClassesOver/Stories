import React, {useEffect} from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Icon, IconButton, MenuItem, Menu } from '@material-ui/core';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import {useHistory} from 'react-router-dom';
import * as  api from "../api";

interface IDataGridProps {
    fetch: (data: { [key: string]: any }) => Promise<any>;
    data: { [key: string]: any },
    pageSize: number;
}
export default (props: IDataGridProps) => {

    const [page, setPage] = React.useState(1);
    const [rowCount, setRowCount] = React.useState(0);
    const [pageCount, setPageCount] = React.useState(1);
    const [rows, setRows] = React.useState<{ id: string, title: string, timestamp: string }[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [links, setLinks] = React.useState({prev: null, next: null});
    const history = useHistory();
     let active = true;
    const update = () => {
        (async () => {
            setLoading(true);
            const resp = await props.fetch({ ...props.data, page, pageSize: props.pageSize });
            let newRows = resp.data.items
            if (!active) {
                return;
            }
            setRows(newRows);
            setLinks(resp.data._links);
            setRowCount(resp.data._meta.total_items);
            setPageCount(resp.data._meta.total_pages);
            setLoading(false);
        })();
    }
    useEffect(() => {
        update();
    }, [page]);
    const onPrevPage = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation();
        setPage(page - 1);
    };
    const onNextPage = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation();
        setPage(page + 1);
    };
    const doEdit = (id: string) => {
        history.push(`/expore/editor/${id}`);
    };
    const doDelete = async (id: string) => {
        await api.removePost(id);
        update();
    };
    return (
        <div className="tm-dv" data-page={page}>
            <div className="tm-dv-h">
                <div className={loading ? `tm-dv-cp waiting`: 'tm-dv-cp'}>{`${page} / ${pageCount}`}</div>
                <div className="tm-dv-ft-pn">
                    <IconButton onClick={onPrevPage} disabled={links.prev == null} size="small" className="tm-dv-prev" ><Icon className="fa fa-angle-left" /></IconButton>
                    <IconButton onClick={onNextPage} disabled={links.next == null}  size="small" className="tm-dv-next" ><Icon className="fa fa-angle-right" /></IconButton>
                </div>
            </div>
            {loading ? <div className="tm-dv-loading"><span className="fa fa-circle-o-notch fa-spin fa-2x fa-fw"></span></div> : rows.map((row, index) => {
                return <div className="tm-dv-row" key={row.id} data-id={row.id}>
                    <div className="tm-dv-title"><Link to={`/expore/view/${row.id}`}>{row.title}</Link></div>
                    <div className="tm-dv-fn">
                        Created&nbsp;
                        <Moment fromNow>{row.timestamp}</Moment>
                        <PopupState variant="popover" popupId="demo-popup-menu">
                            {(popupState) => (
                                <React.Fragment>
                                    <IconButton {...bindTrigger(popupState)} size="small" className="tm-dv-dn" ><Icon style={{ fontSize: '0.8rem' }} className="fa fa-chevron-down" /></IconButton>
                                    <Menu {...bindMenu(popupState)}>
                                        <MenuItem onClick={() => {popupState.close(); doEdit(row.id);}}>Edit</MenuItem>
                                        <MenuItem onClick={() => {popupState.close(); doDelete(row.id);}}>Delete</MenuItem>
                                    </Menu>
                                </React.Fragment>
                            )}
                        </PopupState>

                    </div>
                </div>
            })}
        </div>
    );
}
