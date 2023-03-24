// const currentDate = new Date();
// const date30DaysAgo = Math.floor(
//    (currentDate.getTime() - 31 * 24 * 60 * 60 * 1000) / 1000
// );
// const currentSeconds = Math.floor(currentDate.getTime() / 1000);

export async function fetchData(from: number, to: number, idBank: string, account: number = 0) {
  let requestData = [];
  const monoUrl = 'https://api.monobank.ua/personal/statement';

  if ((to - from) > 2682000) {
    const data = {
      errorDescription:
        'Exceeded limit. The maximum time for which it is possible to receive an extract is 31 days + 1 hour (2682000 seconds).',
    };
    return data;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log('requesting...');
    let reqUrl = `${monoUrl}/${account}/${from}/${to}`;
    const response = await fetch(reqUrl, {
      method: 'GET',
      headers: {
        'X-Token': idBank,
      },
    });
    let data = await response.json();

    if (
      data.errorDescription === "Unknown 'X-Token'" ||
      data.errorDescription === 'invalid account'
    ) {
      return data;
    }

    if (data.errorDescription === "Value field 'to' out of bounds") {
      return {
        errorDescription: data.errorDescription,
        requestData: removeDuplicatesById(requestData),
      };
    }

    if (data.errorDescription === 'Too many requests') {
      console.log('Too many requests waiting 60s ' + 'to countinue fetching: ');
      await new Promise((resolve) => setTimeout(resolve, 60000)); // wait for 60 seconds
      continue; // try again
    }

    requestData.push(...data);

    if (data.length < 500) {
      break; // exit loop
    } else {
      to = requestData[requestData.length - 1].time; // set new from date
    }

    // if (Array.isArray(data)) {
    //    if (data.length >= 11) {

    //       requestData.push(...data);
    //       console.log('requestData',requestData.length);
    //       from = requestData[requestData.length - 1].time;
    //    } else {
    //       requestData.push(...data)
    //       console.log('requestData',requestData.length);
    //       return requestData;
    //    }
    // } else if (
    //    data.errorDescription === 'Too many requests' ||
    //    data.errorDescription
    // ) {
    //    console.log('Too many requests waiting 60s' )
    //    await new Promise((resolve) => setTimeout(resolve, 60000));
    // } else {
    //    throw new Error(
    //       `Failed to fetch data. Status code: ${response.status}`
    //    );
    // }
  }

  //remove dublicates from array
  function removeDuplicatesById(arr: any) {
    const uniqueArray: any = [];
    const ids: any = [];

    arr.forEach((obj: any) => {
      if (!ids.includes(obj.id)) {
        ids.push(obj.id);
        uniqueArray.push(obj);
      }
    });

    return uniqueArray;
  }
  return removeDuplicatesById(requestData);
}

// (async () => {

//    const result = await fetchData(date30DaysAgo, currentSeconds, idBank, account);
//    console.log('result', result.length);
// })();

// console.log(currentSeconds - date30DaysAgo > 2682000)// 2682000
