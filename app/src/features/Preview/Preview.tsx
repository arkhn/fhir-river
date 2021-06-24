import React from "react";

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
  TableFooter,
  Link as MuiLink,
  LinkProps,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import exploredData from "./previewDataMock.json";
import resource from "./PreviewResource.json";

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

const Link = (props: LinkRouterProps) => (
  <MuiLink {...props} component={RouterLink} />
);

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
  link: {
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
  },
}));

const Preview = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();

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
      const indexPrimaryKey = exploredData.fields.indexOf(primarykey);
      console.log(exploredData.rows[index]?.[indexPrimaryKey]);
    }
  };

  return (
    <Container className={classes.container} maxWidth="xl">
      <Link
        className={classes.link}
        variant="h5"
        color="textSecondary"
        to={`/sources/${sourceId}/mappings/${mappingId}`}
        gutterBottom
      >
        <ArrowBack />
        {t("back")}
      </Link>
      <TableContainer className={classes.table}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.cellsTitle}>
              <TableCell className={classes.cells}></TableCell>
              {exploredData.fields.map((field) => (
                <TableCell className={classes.cells} key={uuid()}>
                  {field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {exploredData.rows.map((columnData, index) => (
              <TableRow hover key={uuid()} className={clsx(classes.rowBorder)}>
                <TableCell
                  className={clsx(classes.fhirIconCell, classes.cellsTitle)}
                  onClick={() => handleFhirIconClick(index)}
                >
                  <FhirIconCell />
                </TableCell>
                {columnData.map((an, i) => (
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
