import clsx from 'clsx';
import { useState } from 'react';
import { CenteredLayout } from '~/components';

import { fetchData } from '~/utils/formulas';

export const Login = (): JSX.Element => {
  const [bankStatement, setBankStatement] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const [estimatedWaitingTime, setEstimatedWaitingTime] = useState<number>(8);

  const currentDate = new Date();
  const date30DaysAgo = Math.floor((currentDate.getTime() - 31 * 24 * 60 * 60 * 1000) / 1000);
  const currentSeconds = Math.floor(currentDate.getTime() / 1000);

  async function getDataForYear(token: string, account: number = 0, year: string) {
    const data = [];

    // const account = 0;
    const idBank = token; //Monobank token

    // console.log('result', result.length);
    // setBankStatement(result);

    for (let i = 11; i >= 0; i--) {
      console.log(i)
      // Calculate start and end timestamps for the month
      const startOfMonth = new Date(`${year}-01-01T00:00:00`);
      startOfMonth.setMonth(i, 1);
      const endOfMonth = new Date(`${year}-01-31T23:59:59`);
      // endOfMonth.setMonth(i + 1, 0);
      endOfMonth.setMonth(i + 1, 0);
      console.log('startOfMonth', startOfMonth, 'endOfMonth', endOfMonth);
      // console.log(Date.parse(startOfMonth) / 1000, Date.parse(endOfMonth));
      // Call your function with the start and end timestamps
      const result = await fetchData(
        Date.parse(startOfMonth.toString()) / 1000,
        Date.parse(endOfMonth.toString()) / 1000,
        idBank,
        account,
      );
      if (result.errorDescription) {
        if(result.errorDescription === "Value field 'to' out of bounds"){
           data.push(...result.requestData)
          console.log('res.data',data)
          return {
            errorDescription: result.errorDescription,
            requestData: data,
          };
        } else {
          return result;
        }
      
        // alert("Value field 'to' out of bounds");
      } else {
        // Add the data to the results array
        data.push(...result);

        // Wait for a brief moment before making the next request
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if(data.length > 0){
      setBankStatement(data);
    }
    return data;
  }

  console.log(bankStatement);

  const handleFetchData = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      inputToken: { value: string };
      inputAccount: { value: number };
    };

    const token = formElements.inputToken.value;
    const account = formElements.inputAccount.value || 0;

    if (token.length < 40 || token.length > 50) {
      alert('Inccorect token length');
      return;
    }

    let currentYear = new Date().getFullYear();
    let yearsData = [];
    let estimatedTime = 8;
    setLoading(true);
    setEstimatedWaitingTime(8);

    while (true) {
      console.log(currentYear);

      const res = await getDataForYear(token, account, currentYear.toString());

      if (res.errorDescription) {
        if (res.errorDescription === "Value field 'to' out of bounds") {
          setLoading(false);
          setEstimatedWaitingTime(0);
          console.log('Requests complited, fin part res: ', res);
          yearsData.push(...res.requestData);
          break;
        } else {
          setEstimatedWaitingTime(8);
          setLoading(false);
          alert(res.errorDescription);

          break;
        }
      }

      currentYear = currentYear - 1;
      estimatedTime = estimatedTime - 2 <= 0 ? 1 : estimatedTime - 2;
      setEstimatedWaitingTime(estimatedTime);

      yearsData.push(...res);
    }

    setBankStatement(yearsData.sort((a, b) => a.time - b.time));


    // const result = await fetchData(date30DaysAgo - 2682000, currentSeconds - 2682000, idBank, account);

    // console.log('result', result.length);
    // setBankStatement(result);
  };

  

  function appendDotToAmount(number: number) {
    let numArr = number.toString().split('');
    if (numArr.length === 1) {
      return '0.0' + number.toString();
    }
    let firstPart = numArr.slice(0, numArr.length - 2) || ['0'];
    let secondPart = numArr.slice(numArr.length - 2, numArr.length);
    if (firstPart.length <= 0) {
      firstPart[0] = '0';
    }
    numArr = [...firstPart, '.', ...secondPart];
    return numArr.join('');
  }

  return (
    <CenteredLayout className="gap-1  h-auto flex flex-col ">
      <div className="flex w-auto h-auto p-2 mt-[120px]">
        <h2>Fetched count: {bankStatement.length}</h2>
      </div>
      <form
        className="flex flex-col gap-1 justify-center items-center p-2"
        onSubmit={handleFetchData}
      >
        <input placeholder="token" id="inputToken" className="w-[400px] rounded" required></input>
        <input placeholder="account" id="inputAccount" className="w-[400px] mt-1 rounded"></input>
        <button
          disabled={loading}
          type="submit"
          className="bg-green-200 p-2 mb-2 mt-[10px] rounded "
        >
          Fetch Data
        </button>
      </form>
      {loading ? (
        <div className="flex text-center">
          Loading... <br></br>estimated waiting time: {estimatedWaitingTime} min
        </div>
      ) : null}
      {!loading && estimatedWaitingTime <= 0 ? <div>Data Loaded!</div> : <div></div>}
      {bankStatement.map((el: any, index: number) => {
        return (
          <div
            key={el.id}
            className="flex  w-auto px-3 py-1 gap-1 h-auto text-sm text-red-100 items-center justify-center  bg-red-400  font-bold"
          >
            <h2 className="w-[200px]">
              Time:{' '}
              {(
                new Date(+el.time.toString().split('').slice(0, 10).join('') * 1000) ?? 'null'
              ).toISOString()}
            </h2>
            <h2 className="w-[150px]">Amount: {appendDotToAmount(el.amount)} UAH</h2>
            <h2 className="w-[350px]">Description: {el.description}</h2>
            <h2 className="w-[150px]">CashbackAmount: {appendDotToAmount(el.cashbackAmount)}</h2>
            <h2 className="w-[120px]">CommissionRate: {appendDotToAmount(el.commissionRate)}</h2>
          </div>
        );
      })}
    </CenteredLayout>
  );
};
