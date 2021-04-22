import { TableContainer, withStyles } from "@material-ui/core";

export default withStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    borderTop: "1px solid",
    borderColor: theme.palette.divider,
  },
}))(TableContainer);
