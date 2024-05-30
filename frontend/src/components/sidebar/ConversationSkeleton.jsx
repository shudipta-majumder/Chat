import useMediaQuery from "../../hooks/useMediaquery";

const ConversationSkeleton = () => {
  const underSM = useMediaQuery("(max-width: 640px)");
  return (
    <>
      {underSM ? (
        <div className="flex gap-16 items-center rounded p-2 py-1 bg-gray-700 animate-pulse">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-gray-600"></div>
          </div>
        </div>
      ) : (
        <div className="flex gap-16 items-center rounded p-2 py-1 bg-gray-700 animate-pulse">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-gray-600"></div>
          </div>
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-gray-600"></div>
          </div>

          <div className="flex gap-16 flex-col flex-1">
            <div className="flex gap-3 justify-between">
              <div className="w-24 h-4 bg-gray-600 rounded"></div>
              <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationSkeleton;
