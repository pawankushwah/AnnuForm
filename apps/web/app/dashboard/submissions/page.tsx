"use client";

import { trpc } from "~/trpc/client";
import { format } from "date-fns";
import { Inbox, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export default function SubmissionsPage() {
  const { data: responses, isLoading } = trpc.forms.getAllResponses.useQuery();
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading submissions...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center px-6 shrink-0 sticky top-0 z-10">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Inbox className="h-5 w-5 text-gray-400" />
          Your Submissions
        </h1>
      </div>

      <div className="p-6">
        {responses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Inbox className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">No submissions found</h3>
            <p className="text-gray-500 max-w-md">You haven't submitted any form.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/3">Form</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Date</th>
                    <th className="px-6 py-4 font-semibold w-1/3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {responses?.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {r.formTitle}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {format(new Date(r.createdAt), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedResponse(r)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors bg-white border hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 h-8 px-3 text-gray-700 dark:text-gray-300"
                          >
                            <Eye className="h-3 w-3 mr-1" /> View Data
                          </button>
                          <Link
                            href={`/dashboard/analytics/${r.formId}`}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 h-8 w-8"
                            title="View Form Analytics"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="text-sm text-gray-500 mb-6 pb-4 border-b">
              Form: <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedResponse?.formTitle}</span>
              <br />
              Submitted: {selectedResponse?.createdAt && format(new Date(selectedResponse.createdAt), "MMM d, yyyy h:mm a")}
            </div>
            
            {selectedResponse?.data && Object.entries(selectedResponse.data).map(([fieldId, answer]: [string, any]) => {
              let displayVal = answer;
              if (Array.isArray(answer)) displayVal = answer.join(", ");
              else if (typeof answer === 'boolean') displayVal = answer ? "Yes" : "No";
              else if (!answer) displayVal = "-";

              return (
                <div key={fieldId} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Field ID: {fieldId}</div>
                  <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-medium">
                    {String(displayVal)}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
