import styled from "@emotion/styled";
import { getMerchants, getTransactions, getUsers } from "./utils/GraphQLData";
import { useState, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TablePagination from "@material-ui/core/TablePagination";
import {
  TableContainer,
  TableHead,
  TableBody,
  Typography,
  Box,
  Grid,
} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Moment from "moment";
import FormGroup from "@material-ui/core/FormGroup";
import Switch from "@material-ui/core/Switch";
import CircularProgress from "@material-ui/core/CircularProgress";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#FF6161",
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    maxWidth: 900,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tableHeader: {
    whiteSpace: "nowrap",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  userTotals: {
    float: "right",
  },
});

const AntSwitch = withStyles((theme) => ({
  root: {
    width: 34,
    height: 18,
    padding: 0,
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    "&$checked": {
      transform: "translateX(12px)",
      color: theme.palette.common.white,
      "& + $track": {
        opacity: 1,
        backgroundColor: "#FF6161",
        borderColor: "#FF6161",
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: "none",
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
}))(Switch);

const Content = styled.div`
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
  padding: 10px;
  width: 50%;
`;

const Header = styled.div`
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
  padding: 10px;
`;

const App = () => {
  const [data, setData] = useState("");
  const [page, setPage] = useState(0);
  const [cardIdMapData, setCardIdMapData] = useState("");
  const [merchantIdMapData, setMerchantIdMapData] = useState("");
  const [userTotalMapData, setUserTotalMapData] = useState("");
  const [convertMap, setConvertMap] = useState("");
  const [currency, setCurrency] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(11);
  const classes = useStyles();
  const BASECONVERT = 1.25;

  useEffect(() => {
    async function setAllData() {
      let transactionData = await getTransactions();
      let merchantData = await getMerchants();
      let userData = await getUsers();
      let cardIdMap = new Map();
      let merchantIdMap = new Map();
      let userTotalMap = new Map();
      let transactionTotalMap = new Map();

      userData.map((element) => {
        cardIdMap.set(
          element.cardId,
          element.firstName + " " + element.lastName
        );
      });

      merchantData.map((element) => {
        merchantIdMap.set(element.networkId, element.name);
      });

      transactionData.map((element) => {
        transactionTotalMap.set(element.id, [
          element.amountInUSDCents,
          element.amountInUSDCents * BASECONVERT,
        ]);
        if (userTotalMap.has(element.cardId)) {
          userTotalMap.set(element.cardId, [
            userTotalMap.get(element.cardId)[0] + element.amountInUSDCents,
            userTotalMap.get(element.cardId)[1] +
              element.amountInUSDCents * BASECONVERT,
          ]);
        } else {
          userTotalMap.set(element.cardId, [
            element.amountInUSDCents,
            element.amountInUSDCents * BASECONVERT,
          ]);
        }
      });

      setCardIdMapData(cardIdMap);
      setMerchantIdMapData(merchantIdMap);
      setUserTotalMapData(userTotalMap);
      setConvertMap(transactionTotalMap);

      let allData = {
        transactions: transactionData,
        merchants: merchantData,
        users: userData,
      };
      setData(allData);
    }
    setAllData();
  }, []);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setPage(0);
  };

  const handleChange = (event) => {
    setCurrency(currency === 0 ? 1 : 0);
  };

  return Object.keys(data).length > 0 ? (
    <>
      <div className={classes.wrapper}>
        <Header className={classes.header}>
          <Typography variant="h5">Hoppier</Typography>
          <FormGroup>
            <Typography component="div">
              <Grid component="label" container alignItems="center">
                <Grid item>USD</Grid>
                <Grid item>
                  <AntSwitch checked={currency === 1} onChange={handleChange} />
                </Grid>
                <Grid item>CAD</Grid>
              </Grid>
            </Typography>
          </FormGroup>
        </Header>
        <Box display="flex" justifyContent="space-around">
          <Content>
            {" "}
            <TableContainer component={Paper}>
              <caption className={classes.tableHeader}>
                <Typography variant="subtitle1">Transction History</Typography>
              </caption>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">Date</StyledTableCell>
                    <StyledTableCell align="center">Amount</StyledTableCell>
                    <StyledTableCell align="center">
                      Card Holder
                    </StyledTableCell>
                    <StyledTableCell align="center">Merchant</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.transactions
                    ?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((t) => {
                      return (
                        <StyledTableRow key={t.id}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {Moment(t.date).format("MMM Do YYYY")}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            ${(convertMap.get(t.id)[currency] / 100).toFixed(2)}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {cardIdMapData.get(t.cardId)}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {merchantIdMapData.get(t.merchantNetworkId)}
                          </StyledTableCell>
                        </StyledTableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[8, 11]}
              component="div"
              count={data.transactions?.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Content>
          <Content>
            {" "}
            <TableContainer component={Paper}>
              <caption className={classes.tableHeader}>
                <Typography variant="subtitle1">User Totals</Typography>
              </caption>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">User</StyledTableCell>
                    <StyledTableCell align="center">
                      Amount Spent
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(userTotalMapData)
                    ?.sort(([_, v1], [__, v2]) => v2[currency] - v1[currency])
                    .map(([key, val]) => {
                      return (
                        <StyledTableRow key={key}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {cardIdMapData.get(key)}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            ${(val[currency] / 100).toFixed(2)}
                          </StyledTableCell>
                        </StyledTableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Content>
        </Box>
      </div>
    </>
  ) : (
    <CircularProgress />
  );
};

export default App;
