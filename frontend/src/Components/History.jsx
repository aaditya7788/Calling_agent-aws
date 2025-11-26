import { useEffect, useState } from "react";
import { fetchCallHistory } from "../../api/requests";

const History = ({ googleId }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const data = await fetchCallHistory(googleId);
        console.log("Fetched history data:", data);
        setHistoryData(data.history);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch call history:", error);
        setLoading(false);
      }
    };

    getHistory();
  }, [googleId]);

  const openModal = (call) => {
    setSelectedCall(call);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCall(null);
  };

  if (loading) {
    return <p className="text-white">Loading call history...</p>;
  }

  return (
    <section
      id="history"
      className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-[10vw] py-8 overflow-auto overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-semibold mb-10">
          Call History
        </h1>

        {/* Call History Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyData.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openModal(item)}
              className="bg-[#264533] border-2 border-[#38E07A] rounded-lg p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-semibold">{item.contactName}</h3>
                <span className="text-[#38E07A] text-2xl">📞</span>
              </div>
              <div className="space-y-2 text-gray-300 text-sm">
                <p><span className="text-[#38E07A]">Phone:</span> {item.phoneNumber}</p>
                <p><span className="text-[#38E07A]">Goal:</span> {item.goal}</p>
                <p><span className="text-[#38E07A]">Time:</span> {new Date(item.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {historyData.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-xl">No call history yet</p>
            <p className="text-sm mt-2">Start making calls to see your history here</p>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedCall && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-[#1a2e1a] border-2 border-[#38E07A] rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-2xl font-bold">Call Details</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-[#38E07A] text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-white">
                <div>
                  <p className="text-[#38E07A] font-semibold">Contact Name</p>
                  <p className="text-lg">{selectedCall.contactName}</p>
                </div>

                <div>
                  <p className="text-[#38E07A] font-semibold">Phone Number</p>
                  <p className="text-lg">{selectedCall.phoneNumber}</p>
                </div>

                <div>
                  <p className="text-[#38E07A] font-semibold">Goal</p>
                  <p className="text-lg">{selectedCall.goal}</p>
                </div>

                <div>
                  <p className="text-[#38E07A] font-semibold">AI Personality</p>
                  <p className="text-lg">{selectedCall.aiPersonality}</p>
                </div>

                <div>
                  <p className="text-[#38E07A] font-semibold">Voice Choice</p>
                  <p className="text-lg">{selectedCall.voiceChoice}</p>
                </div>

                <div>
                  <p className="text-[#38E07A] font-semibold">Timestamp</p>
                  <p className="text-lg">{new Date(selectedCall.timestamp).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-[#38E07A] font-semibold">Script</p>
                  <p className="text-lg bg-[#0f1c0f] p-4 rounded border border-[#38E07A]">
                    {selectedCall.script}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="mt-6 w-full bg-[#38E07A] text-[#122117] font-semibold py-3 rounded-lg hover:bg-[#2bc465] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default History;