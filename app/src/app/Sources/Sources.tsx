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
    paddingTop: theme.spacing(5),
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

  const editSource = (source: Source) => {
    setSourceToEdit(source);
    handleToggleDrawer();
  };

  const onClickCreateSource = () => {
    setSourceToEdit(undefined);
    handleToggleDrawer();
  };

  const handleToggleDrawer = () => {
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
            onClick={onClickCreateSource}
          >
            <Typography>New Source</Typography>
          </Button>
        </Grid>
      </Grid>
      <SourceGrid editSource={editSource} />
      <Drawer open={openDrawer} onClose={handleToggleDrawer} anchor="right">
        <SourceForm submitSuccess={handleToggleDrawer} source={sourceToEdit} />
      </Drawer>
    </Container>
  );
};

export default Sources;
