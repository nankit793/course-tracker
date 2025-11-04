interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserListProps {
  users: User[];
  onDelete: (id: string) => void;
}

export default function UserList({ users, onDelete }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No users found. Create your first user!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {users.map((user) => (
        <div
          key={user._id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onDelete(user._id)}
              className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
