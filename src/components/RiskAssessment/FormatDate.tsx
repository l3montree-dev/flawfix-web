import React from "react";

const FormatDate = ({ dateString }: { dateString: string }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Monate sind 0-basiert
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes} ${year}-${month}-${day}`;
  };

  return <time dateTime={dateString}>{formatDate(dateString)}</time>;

  return <time dateTime={dateString}>{formatDate(dateString)}</time>;
};

export default FormatDate;
