export type TimelineEvent = {
  timestamp: number;
  observerId: string;
  series: string | undefined;
  value: any;
};
