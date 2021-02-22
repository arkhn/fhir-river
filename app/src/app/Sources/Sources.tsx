import {
  Button,
  Container,
  Drawer,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import SourceForm from "features/sources/SourceForm";
import SourceGrid from "features/sources/SourceGrid";
import React, { useState } from "react";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingBlock: theme.spacing(3),
  },
  button: {
    textTransform: "none",
  },
}));

const Sources = (): JSX.Element => {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);

  const _toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <Container maxWidth="xl">
      <Grid className={classes.gridContainer} spacing={3} container>
        <Grid item>
          <Button
            className={classes.button}
            color="primary"
            variant="contained"
            onClick={_toggleDrawer}
          >
            <Typography>New Source</Typography>
          </Button>
        </Grid>
      </Grid>
      <SourceGrid />
      <Drawer open={openDrawer} onClose={_toggleDrawer} anchor="right">
        <SourceForm submit={_toggleDrawer} />
      </Drawer>
    </Container>
  );
};

export default Sources;
