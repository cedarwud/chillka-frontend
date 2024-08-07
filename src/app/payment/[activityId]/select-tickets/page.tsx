import { fetchActivity } from '@action/activity';
import SelectTicketsSection from '@app/payment/utils/SelectTicketsSection';

type PaymentPageProps = {
  params: { activityId: string };
};

const PaymentPage = async ({ params }: PaymentPageProps) => {
  const { activityId } = params;

  const response = await fetchActivity(activityId);
  const data = response.result;

  return (
    <section className="flex flex-row gap-2">
      {data && <SelectTicketsSection activityId={activityId} data={data} />}
    </section>
  );
};

export default PaymentPage;
