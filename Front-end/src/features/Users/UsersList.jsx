import { useState } from "react";
import { useUsers } from "./useUsers";
import Spinner from "../../ui/Spinner";
import UserItem from "./UserItem";
import { Search, Users as UsersIcon } from "lucide-react";

function UsersList() {
  const { isLoading, users } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter((user) =>
    user?.name?.toLowerCase().trim().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* List Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size={32} className="text-blue-600" />
          </div>
        ) : filteredUsers?.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <UsersIcon size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          filteredUsers?.map((user, index) => (
            <UserItem key={user.userId || index} user={user} />
          ))
        )}
      </div>
    </div>
  );
}

export default UsersList;
