import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  makeStyles,
  Typography,
  IconButton,
  Table,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  TableBody,
  TablePagination,
  TableFooter,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { Resource } from "services/api/generated/api.generated";

import apiAnswer from "./previewDataMock.json";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(5),
  },
  table: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    overflowX: "scroll",
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: "none",
    borderCollapse: "separate",
  },
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  iconFlame: {
    fill: "#CC7831",
  },
  fhirIconCell: {
    boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    position: "sticky",
    left: 0,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    width: 25,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  cells: {
    whiteSpace: "nowrap",
    boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  texts: {
    textAlign: "center",
    margin: theme.spacing(4),
  },
  cellsTitle: {
    background: theme.palette.background.paper,
  },
  rowBorder: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  paginationTable: {
    width: "100%",
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    borderTop: "none",
    border: `1px solid ${theme.palette.divider}`,
    padding: 0,
  },
}));

const resource: Resource = {
  created_at: "2021-06-07T12:05:35.185414+02:00",
  definition_id: "Account",
  id: "ckpmg7tqn00070qm44o1qd4uf",
  label: "account",
  logical_reference: "ckpmg7tqo00080qm40dc8snuv",
  primary_key_column: "id",
  primary_key_owner: "ckpmg74v800060qm4e2se653z",
  primary_key_table: "auth_group",
  source: "ckpmg6c0w00030qm4wj70fqbl",
  updated_at: "2021-06-07T12:05:35.185334+02:00",
};

const Preview = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const FhirIconCell = () => (
    <IconButton size="small" className={classes.icon}>
      <Icon
        icon={IconNames.FLAME}
        iconSize={15}
        className={classes.iconFlame}
      />
    </IconButton>
  );

  const handleFhirIconClick = (index: number) => {
    const primarykey = resource.primary_key_table;
    if (primarykey) {
      const indexPrimaryKey = apiAnswer.fields.indexOf(primarykey);
      apiAnswer.rows[index]?.[indexPrimaryKey];
    }
  };

  return (
    <Container className={classes.container} maxWidth="xl">
      <TableContainer className={classes.table}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.cellsTitle}>
              <TableCell className={classes.cells}></TableCell>
              {apiAnswer.fields.map((field) => (
                <TableCell className={classes.cells} key={uuid()}>
                  {field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {apiAnswer.rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((answer, index) => (
                <TableRow
                  hover
                  key={uuid()}
                  className={clsx(classes.rowBorder)}
                >
                  <TableCell
                    className={clsx(classes.fhirIconCell, classes.cellsTitle)}
                    onClick={() => handleFhirIconClick(index)}
                  >
                    <FhirIconCell />
                  </TableCell>
                  {answer.map((an, i) => (
                    <TableCell className={classes.cells} key={i}>
                      {an}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        size="small"
        className={classes.paginationTable}
        rowsPerPageOptions={[10, 20, 30]}
        rowsPerPage={rowsPerPage}
        count={apiAnswer.rows.length}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <div className={classes.texts}>
        <Typography>
          {t("clickOnAFireIcon")}{" "}
          <Icon icon={IconNames.FLAME} className={classes.iconFlame} />{" "}
          {t("inOrderToPreview")}
        </Typography>
      </div>
    </Container>
  );
};

export default Preview;
