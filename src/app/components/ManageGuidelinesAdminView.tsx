import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

import { UserProfile } from '@/lib/types';

// Define the Guideline interface since it's not exported from lib/types
interface Guideline {
  id: string;
  name: string;
  description: string;
  categories?: string[];
  createdBy?: string;
  createdByName?: string;
}

interface ManageGuidelinesAdminViewProps {
  guidelines: Guideline[];
  userProfile: UserProfile;
  isAdmin: boolean;
  onEditGuideline: (guideline: Guideline) => void;
  onDeleteGuideline: (guidelineId: string) => void;
}

const ManageGuidelinesAdminView: React.FC<ManageGuidelinesAdminViewProps> = ({
  guidelines,
  userProfile,
  isAdmin,
  onEditGuideline,
  onDeleteGuideline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get unique categories from all guidelines
  const categories = Array.from(new Set(guidelines.flatMap((g) => g.categories || []))).sort();

  // Filter guidelines based on search query and selected category
  const filteredGuidelines = guidelines.filter((guideline) => {
    const matchesSearch =
      searchQuery === '' ||
      guideline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guideline.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === '' ||
      (guideline.categories && guideline.categories.includes(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  // Check if user can edit this guideline (admin or creator)
  const canEditGuideline = (guideline: Guideline) => {
    return isAdmin || guideline.createdBy === userProfile.userId;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Manage Guidelines</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search guidelines..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredGuidelines.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">No guidelines found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuidelines.map((guideline) => (
                <tr key={guideline.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {guideline.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {guideline.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {guideline.categories?.join(', ') || 'None'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {guideline.createdByName || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canEditGuideline(guideline) && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEditGuideline(guideline)}
                          className="text-blue-400 hover:text-blue-500"
                          aria-label={`Edit ${guideline.name}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => onDeleteGuideline(guideline.id)}
                          className="text-red-400 hover:text-red-500"
                          aria-label={`Delete ${guideline.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageGuidelinesAdminView;
