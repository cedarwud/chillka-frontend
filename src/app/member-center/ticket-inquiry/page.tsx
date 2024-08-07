'use client';

import {
  TicketsAPIResponse,
  TicketsInfoType,
  getTickets,
} from '@action/ticket';
import Loading from '@app/member-center/ticket-inquiry/Loading';
import NoTicket from '@app/member-center/ticket-inquiry/NoTicket';
import QRCodePopUp from '@components/QRCodePopUp';
import SortOrder from '@components/SortOrder';
import TicketPopUp from '@components/TicketPopUp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import useWindowSize from '@hooks/use-window-size';
import { useCallback, useEffect, useState } from 'react';

const TicketInquiry = () => {
  const [usableTickets, setUsableTickets] = useState<TicketsInfoType[]>([]);
  const [unusableTickets, setUnusableTickets] = useState<TicketsInfoType[]>([]);
  const [sort, setSort] = useState<string>('paymentDate');
  const [isLoading, seIsLoading] = useState(true);
  const [QRCodePopUpState, setQRCodePopUpState] = useState<boolean[]>([]);
  const { width } = useWindowSize();

  const changeSort = (value: string) => setSort(value);
  const handleSort = useCallback(
    (tickets: TicketsInfoType[]) => {
      return tickets.sort((a: TicketsInfoType, b: TicketsInfoType) => {
        switch (sort) {
          case 'paymentDate':
            return (
              new Date(b.ticket.createdAt).getTime() -
              new Date(a.ticket.createdAt).getTime()
            );
          case 'endTime':
            return (
              new Date(b.ticket.endDateTime).getTime() -
              new Date(a.ticket.endDateTime).getTime()
            );
          case 'paymentAmount':
            return b.ticket.price - a.ticket.price;
          default:
            return 0;
        }
      });
    },
    [sort]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const switchQRCodePopUpState = (state: string) => {
    setQRCodePopUpState(
      state === 'usableTicket'
        ? usableTickets.map(() => false)
        : unusableTickets.map(() => false)
    );
  };

  const handleOpenQRCodePopUp = (ticketIndex: number) => {
    setQRCodePopUpState((prev) =>
      prev.map((_, steteIndex: number) => steteIndex === ticketIndex && true)
    );
  };

  useEffect(() => {
    setUsableTickets((prev) => handleSort([...prev]));
    setUnusableTickets((prev) => handleSort([...prev]));
    setQRCodePopUpState((prev) => prev.map(() => false));
  }, [sort, handleSort]);

  useEffect(() => {
    (async () => {
      const result: TicketsAPIResponse = await getTickets();
      if (result.status === 'failed' || !result.data) return;
      const usableTicketList = result.data.data
        .filter((ticket: TicketsInfoType) => ticket.orderStatus === '有效')
        .sort(
          (a: TicketsInfoType, b: TicketsInfoType) =>
            new Date(b.ticket.createdAt).getTime() -
            new Date(a.ticket.createdAt).getTime()
        );
      const unusableTicketList = result.data.data
        .filter(
          (ticket: TicketsInfoType) =>
            ticket.orderStatus === '已使用' || ticket.orderStatus === '無效票券'
        )
        .sort(
          (a: TicketsInfoType, b: TicketsInfoType) =>
            new Date(b.ticket.createdAt).getTime() -
            new Date(a.ticket.createdAt).getTime()
        );
      const setQRCodePopUpStateList = usableTicketList.map(() => false);

      setUsableTickets(usableTicketList);
      setUnusableTickets(unusableTicketList);
      setQRCodePopUpState(setQRCodePopUpStateList);
      seIsLoading(false);
    })();
  }, []);

  return (
    <div className="relative text-primary">
      <div className="relative mb-6 h-[8.125rem] xl:flex xl:h-fit xl:items-center xl:justify-between">
        <h1 className="mb-8 text-5xl/none font-bold xl:mb-0">查詢票券</h1>
        <SortOrder
          className="absolute bottom-0 left-0 xl:static"
          state={sort}
          changeState={changeSort}
        />
      </div>
      <Tabs defaultValue="usableTicket">
        <TabsList className="h-fit w-full justify-start border-b-[0.0625rem] bg-surface p-0 xl:border-b-0">
          <TabsTrigger
            className="mr-6 bg-surface px-0 py-6 text-xl font-bold text-primary data-[state=active]:border-b-4 data-[state=active]:pb-5 data-[state=active]:text-primary"
            value="usableTicket"
            onClick={() => switchQRCodePopUpState('usableTicket')}
          >
            可使用
          </TabsTrigger>
          <TabsTrigger
            className="bg-surface px-0 py-6 text-xl font-bold text-primary data-[state=active]:border-b-4 data-[state=active]:pb-5 data-[state=active]:text-primary"
            value="unusableTicket"
            onClick={() => switchQRCodePopUpState('unusableTicket')}
          >
            已使用或過期
          </TabsTrigger>
        </TabsList>
        <ul className="hidden grid-cols-[7fr_2fr_2fr_2fr] border-y-[0.0625rem] py-4 text-xl font-bold xl:grid">
          <li className="pl-3 text-left">活動名稱</li>
          <li className="text-center">數量</li>
          <li className="text-center">使用期限</li>
          <li className="text-center">開啟票券</li>
        </ul>
        <TabsContent value="usableTicket">
          {isLoading && <Loading />}
          {usableTickets.length > 0 &&
            !isLoading &&
            usableTickets.map((ticket: TicketsInfoType, index: number) => (
              <TicketPopUp
                ticketName={`${ticket.activity.name} | ${ticket.ticket.name}`}
                ticketQuantity={ticket.payment.orderNumber}
                orderNumber={ticket.serialNumber}
                endTime={ticket.ticket.endDateTime}
                organizer={ticket.activity.organizer.name}
                purchaseDate={ticket.ticket.createdAt}
                price={ticket.ticket.price}
                pay={ticket.payment.type}
                state={ticket.payment.status}
                // link={ticket.paymen.link}
                openQRCodePopUp={() => handleOpenQRCodePopUp(index)}
                key={ticket._id}
                disabled={ticket.payment.status !== '已付款'}
              >
                <div className="block grid-cols-[7fr_2fr_2fr_2fr] py-4 text-xl font-bold xl:grid">
                  <h3 className="mb-[1.25rem] flex items-center pl-3 text-left xl:mb-0 xl:font-bold">
                    {`${ticket.activity.name} | ${ticket.ticket.name}`}
                  </h3>
                  <p className="mr-2 inline-block bg-primary px-2 py-1 text-xs/5 font-medium text-white xl:mr-0 xl:flex xl:items-center xl:justify-center xl:bg-surface xl:p-0 xl:text-xl xl:font-bold xl:text-primary xl:group-hover:bg-primary/[0.00]">
                    {width > 1366
                      ? ticket.payment.orderNumber
                      : `數量：${ticket.payment.orderNumber}`}
                  </p>
                  <p className="inline-block bg-primary px-2 py-1 text-xs/5 font-medium text-white xl:flex xl:items-center xl:justify-center xl:bg-surface xl:p-0 xl:text-xl xl:font-bold xl:text-primary xl:group-hover:bg-primary/[0.00]">
                    {width > 1366
                      ? `${formatDate(ticket.ticket.endDateTime) === '2100.01.01' ? '無期限' : formatDate(ticket.ticket.endDateTime)}`
                      : `使用期限：${formatDate(ticket.ticket.endDateTime) === '2100.01.01' ? '無期限' : formatDate(ticket.ticket.endDateTime)}`}
                  </p>
                  <div className="xl:flex xl:items-center xl:justify-center">
                    <QRCodePopUp
                      popUpState={QRCodePopUpState[index]}
                      handleOpenPopUp={() => handleOpenQRCodePopUp(index)}
                      handleClosePopUp={() =>
                        setQRCodePopUpState((prev) => prev.map(() => false))
                      }
                      name={ticket.orderContact.name}
                      startTime={ticket.ticket.startDateTime}
                      endTime={ticket.ticket.endDateTime}
                      id={ticket.serialNumber}
                      disabled={ticket.payment.status === '待付款'}
                    />
                  </div>
                </div>
              </TicketPopUp>
            ))}
          {usableTickets.length === 0 && !isLoading && <NoTicket />}
        </TabsContent>
        <TabsContent value="unusableTicket">
          {isLoading && <Loading />}
          {unusableTickets.length > 0 &&
            !isLoading &&
            unusableTickets.map((ticket: TicketsInfoType, index: number) => (
              <TicketPopUp
                ticketName={`${ticket.activity.name} | ${ticket.ticket.name}`}
                ticketQuantity={ticket.payment.orderNumber}
                orderNumber={ticket.serialNumber}
                endTime={ticket.ticket.endDateTime}
                organizer={ticket.activity.organizer.name}
                purchaseDate={ticket.ticket.createdAt}
                price={ticket.ticket.price}
                pay={ticket.payment.type}
                state={ticket.payment.status}
                // link={ticket.paymen.link}
                openQRCodePopUp={() => handleOpenQRCodePopUp(index)}
                key={ticket._id}
                disabled
              >
                <div className="block grid-cols-[7fr_2fr_2fr_2fr] py-4 text-xl font-bold xl:grid">
                  <h3 className="mb-[1.25rem] text-left xl:mb-0 xl:font-bold">
                    {ticket.ticket.name}
                  </h3>
                  <p className="mr-2 inline-block bg-primary px-2 py-1 text-xs/5 font-medium text-white group-hover:bg-primary/[0.00] xl:mr-0 xl:flex xl:items-center xl:justify-center xl:bg-surface xl:p-0 xl:text-xl xl:font-bold xl:text-primary">
                    {width > 1366
                      ? ticket.payment.orderNumber
                      : `數量：${ticket.payment.orderNumber}`}
                  </p>
                  <p className="inline-block bg-primary px-2 py-1 text-xs/5 font-medium text-white group-hover:bg-primary/[0.00] xl:flex xl:items-center xl:justify-center xl:bg-surface xl:p-0 xl:text-xl xl:font-bold xl:text-primary">
                    {width > 1366
                      ? formatDate(ticket.ticket.endDateTime)
                      : `使用期限：${formatDate(ticket.ticket.endDateTime)}`}
                  </p>
                  <div className="xl:flex xl:items-center xl:justify-center" />
                </div>
              </TicketPopUp>
            ))}
          {unusableTickets.length === 0 && !isLoading && <NoTicket />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketInquiry;
