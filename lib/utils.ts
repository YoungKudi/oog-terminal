import { supabase } from './db';

export const getTabCounts = async () => {
  try {
    // Get queue count
    const { count: queueCount } = await supabase
      .from('ImportQueue')
      .select('*', { count: 'exact', head: true });

    // Get receivals count (last 4 days)
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const { count: receivalsCount } = await supabase
      .from('Container')
      .select('*', { count: 'exact', head: true })
      .gte('receivedDate', fourDaysAgo.toISOString().split('T')[0]);

    // Get tallies count (all containers)
    const { count: talliesCount } = await supabase
      .from('Container')
      .select('*', { count: 'exact', head: true });

    // Get devanning count (pending)
    const { count: devanningCount } = await supabase
      .from('DevanningQueue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get unstuffed count
    const { count: unstuffedCount } = await supabase
      .from('UnstuffedContainer')
      .select('*', { count: 'exact', head: true });

    return {
      queue: queueCount || 0,
      receivals: receivalsCount || 0,
      tallies: talliesCount || 0,
      devanning: devanningCount || 0,
      unstuffed: unstuffedCount || 0,
    };
  } catch (error) {
    console.error('Error fetching tab counts:', error);
    return { queue: 0, receivals: 0, tallies: 0, devanning: 0, unstuffed: 0 };
  }
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncateText = (text: string, length: number = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
