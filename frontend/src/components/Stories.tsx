import React, { useEffect, useState } from 'react';
import { UserIdType } from '../interface';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Button, Paper, Tabs, Tab, Typography, Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import PostsDataView from './PostsDataView';
import * as api from '../api';

interface IStories {
    userId: UserIdType;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            className="tm-tabpanel"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}><Typography>{children}</Typography></Box>

            )}
        </div>
    );
}
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        tabs: {
            '& button': {
                textTransform: 'capitalize',
            }
        }
    }),
);


const Stories: React.FC<IStories> = (props) => {
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };
    const history = useHistory();
    const onClickNewStory = (event: React.MouseEvent<HTMLButtonElement>) => {
        history.push('/expore/editor/new');
    }
    const fetchDraftPosts = (data: {[key: string] : any}) => {
        return api.getDraftPosts(data);
    }
    const fetchPublishedPosts = (data: {[key: string] : any}) => {
        return api.getPushlishedPosts(data);
    }
    return <div className="tm-me-stories">
        <div className="tm-me-stories-header">
            <h1 className="header">Your stories</h1>
            <div className="buttons">
                <Button onClick={onClickNewStory}>+ New a Story</Button>
            </div>
        </div>
        <Paper className={classes.root}>
            <Tabs
                className={classes.tabs}
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="Drafts" />
                <Tab label="Published" />
            </Tabs>
        </Paper>
        <TabPanel value={value} index={0}>
            <PostsDataView fetch={fetchDraftPosts}  pageSize={8} data={{}}/>
        </TabPanel>
        <TabPanel value={value} index={1}>
            <PostsDataView fetch={fetchPublishedPosts} pageSize={8} data={{}}/>
        </TabPanel>
    </div>

}




export default Stories;