import React, { useState } from "react";
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

import { Source } from "services/api/generated/api.generated";

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
  const [sourceToEdit, setSourceToEdit] = useState<Source | undefined>(
    undefined
  );

  const _editSource = (source: Source) => {
    setSourceToEdit(source);
    _toggleDrawer();
  };

  const _onClickCreateSource = () => {
    setSourceToEdit(undefined);
    _toggleDrawer();
  };

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
            onClick={_onClickCreateSource}
          >
            <Typography>New Source</Typography>
          </Button>
        </Grid>
      </Grid>
      <SourceGrid editSource={_editSource} />
      <Drawer open={openDrawer} onClose={_toggleDrawer} anchor="right">
        <SourceForm submit={_toggleDrawer} source={sourceToEdit} />
      </Drawer>
    </Container>
  );
};

export default Sources;
