import useGetConversations from "../../hooks/useGetConversations";
import { getRandomEmoji } from "../../utils/emojis";
import Conversation from "./Conversation";
import ConversationSkeleton from "./ConversationSkeleton";

const Conversations = () => {
  const { loading, conversations } = useGetConversations();
  const skeletonCount = 5;
  return (
    <div className="py-2 flex flex-col overflow-auto">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, idx) => (
            <ConversationSkeleton key={idx} />
          ))
        : conversations.map((conversation, idx) => (
            <Conversation
              key={conversation._id}
              conversation={conversation}
              emoji={getRandomEmoji()}
              lastIdx={idx === conversations.length - 1}
            />
          ))}
    </div>
  );
};
export default Conversations;

// STARTER CODE SNIPPET
// import Conversation from "./Conversation";

// const Conversations = () => {
// 	return (
// 		<div className='py-2 flex flex-col overflow-auto'>
// 			<Conversation />
// 			<Conversation />
// 			<Conversation />
// 			<Conversation />
// 			<Conversation />
// 			<Conversation />
// 		</div>
// 	);
// };
// export default Conversations;
