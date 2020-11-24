import React, { useState, useEffect } from 'react';
import { makeStyles , useTheme, Theme, createStyles} from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

interface IDrawerProps {
    children? : any;
    anchor: Anchor;
    open: boolean;
    toggleOpen: (open: boolean) => void;
    title?:  string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      flexShrink: 0,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
    },

  }),
);

type Anchor = 'top' | 'left' | 'bottom' | 'right';

const Drawer: React.FC<IDrawerProps> = (props) => {
    const classes = useStyles();
    const theme = useTheme();
    const toggleDrawer = (open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event &&
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        props.toggleOpen(open);
    };

    return (
        <div>
            <React.Fragment >
                <SwipeableDrawer
                    variant='persistent'
                    anchor={props.anchor}
                    open={props.open}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}
                    className={classes.drawer}
                >
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={toggleDrawer(false)} >
                            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                        <span>{props.title}</span>
                    </div>
                    <Divider />
                {props.children}
                </SwipeableDrawer>
            </React.Fragment>
        </div>
    );
}

export default Drawer;