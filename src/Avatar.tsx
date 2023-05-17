interface PropsAvatar {
  username: string;
  isOnline: boolean;
}

function Avatar(props: PropsAvatar) {
  const { username, isOnline = false } = props;

  return (
    <div className="w-8 h-8 relative flex items-center rounded-full bg-red-200 text-xs font-medium">
      <span className="block w-full text-center opacity-70">
        {username[0].toLocaleUpperCase()}
      </span>
      {isOnline && (
        <div className="absolute w-3 h-3 bottom-0 right-0 bg-green-500 rounded-full border border-white"></div>
      )}
    </div>
  );
}

export default Avatar;
