export const getSectionTheme = (secName) => {
  const lname = (secName || '').toLowerCase();
  if (lname.includes('first') || lname.includes('floor')) {
    return {
      headerBadge: 'bg-blue-50 border-blue-200 text-blue-800',
      runningCard: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md',
      runningBadge: 'bg-blue-800 text-blue-100',
      runningSplitBtn: 'bg-blue-800/80 text-blue-100 hover:bg-blue-900 border-blue-600',
      runningBorder: 'border-blue-500',
      runningPrice: 'text-amber-300',
      runningMins: 'text-blue-100',
      filterActive: 'bg-blue-600 text-white shadow-sm'
    };
  }
  if (lname.includes('ac')) {
    return {
      headerBadge: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      runningCard: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md',
      runningBadge: 'bg-blue-800 text-blue-100',
      runningSplitBtn: 'bg-blue-800/80 text-blue-100 hover:bg-blue-900 border-blue-600',
      runningBorder: 'border-blue-500',
      runningPrice: 'text-amber-300',
      runningMins: 'text-indigo-100',
      filterActive: 'bg-indigo-600 text-white shadow-sm'
    };
  }
  if (lname.includes('parcel') || lname.includes('takeaway')) {
    return {
      headerBadge: 'bg-blue-50 border-blue-200 text-blue-800',
      runningCard: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md',
      runningBadge: 'bg-blue-800 text-blue-100',
      runningSplitBtn: 'bg-blue-800/80 text-blue-100 hover:bg-blue-900 border-blue-600',
      runningBorder: 'border-blue-500',
      runningPrice: 'text-amber-300',
      runningMins: 'text-blue-100',
      filterActive: 'bg-blue-600 text-white shadow-sm'
    };
  }
  return {
    headerBadge: 'bg-blue-50 border-blue-200 text-blue-800',
    runningCard: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md',
    runningBadge: 'bg-blue-800 text-blue-100',
    runningSplitBtn: 'bg-blue-800/80 text-blue-100 hover:bg-blue-900 border-blue-600',
    runningBorder: 'border-blue-500',
    runningPrice: 'text-amber-300',
    runningMins: 'text-blue-100',
    filterActive: 'bg-blue-600 text-white shadow-sm'
  };
};
