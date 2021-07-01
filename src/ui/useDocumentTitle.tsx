import React from "react";

function useDocumentTitle(title: string) {
  const originalTitle = React.useRef(document.title);

  React.useEffect(() => {
    if (title.length === 0) {
      document.title = "Datastore Admin";
    } else {
      document.title = `${title} - Datastore Admin`;
    }
  }, [title]);

  React.useEffect(
    () => () => {
      document.title = originalTitle.current;
    },
    [],
  );
}

export default useDocumentTitle;
