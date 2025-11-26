
import { fetchStatistics } from '../../api/requests';
import { useEffect, useState } from 'react';
const Dashboard = ({ setTab, googleId }) => {
  const [stats, setStats] = useState([
    { title: "Calls Today", value: 0 },
    { title: "Total Calls", value: 0 },
    { title: "Total Campaigns", value: 0 },
    { title: "Campaign Calls", value: 0 },
    { title: "Failed Calls", value: 0 },
  ]);

  useEffect(() => {
    const getStatistics = async () => {
      try {
        const data = await fetchStatistics(googleId);
        console.log("Dashboard Data:", data);
        setStats([
          { title: "Calls Today", value: data.todaysCalls || 0 },
          { title: "Total Calls", value: data.totalCalls || 0 },
          { title: "Total Campaigns", value: data.totalCampaigns || 0 },
          { title: "Campaign Calls", value: data.totalCalls || 0 },
          { title: "Failed Calls", value: data.failedCalls || 0 },
        ]);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };

    getStatistics();
  }, [googleId]);

  const campaigns = [
    { name: 'Campaign Alpha', status: 'Active', progress: 75 },
    { name: 'Campaign Beta', status: 'Paused', progress: 50 },
    { name: 'Campaign Gamma', status: 'Completed', progress: 100 },
  ];

  return (
    <section
      id="dashboard"
      className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-[10vw] py-8 overflow-auto overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-semibold mb-10">
          Overview
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-main-color text-white rounded-3xl p-6 flex flex-col items-center justify-center h-40 shadow-md transition-transform hover:scale-105 duration-200"
            >
              <h3 className="text-lg sm:text-xl font-bold">{item.title}</h3>
              <h2 className="text-xl sm:text-2xl font-semibold">{item.value}</h2>
            </div>
          ))}
        </div>

        {/* Motivational Quote */}
        <div className='mt-14 mb-6 bg-gradient-to-r from-green-900 to-green-700 rounded-2xl p-8 border-2 border-green-500 shadow-lg hover:shadow-2xl transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <div className='text-6xl animate-pulse'>📞</div>
            <div className='flex-1'>
              <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2 italic">
                "Every call is an opportunity to make a connection and create impact."
              </h2>
              <p className='text-green-200 text-sm sm:text-base font-medium'>
                — Your AI Calling Agent 🤖
              </p>
            </div>
            <div className='hidden md:block text-5xl opacity-20'>
              🎯
            </div>
          </div>
        </div>

        {/* <div className="overflow-x-auto rounded-lg border border-green-800">
          <table className="min-w-full text-white text-left">
            <thead className="bg-[#1f2d1f] text-gray-300 text-sm sm:text-base">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
              </tr>
            </thead>
            <tbody className="bg-[#0f1c0f]">
              {campaigns.map((campaign, idx) => (
                <tr key={idx} className="border-t border-green-800">
                  <td className="px-6 py-4">{campaign.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#1c331c] text-white px-4 py-1 rounded-full text-sm">
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 h-2 rounded">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <span className="text-sm">{campaign.progress}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}

        <div className=' flex flex-col sm:flex-row gap-x-5'>
            <button onClick={()=> setTab('Call')} className="mt-6 px-4 py-2 bg-main-color font-bold text-white rounded-lg hover:bg-green-700 transition-colors">
                New Call
            </button>
            <button onClick={() => setTab('Campaign')} className="mt-6 px-4 py-2 bg-main-color font-bold text-white rounded-lg hover:bg-green-700 transition-colors">
                New Campaign
            </button>
            {/* <button className="mt-6 px-4 py-2 bg-main-color font-bold text-white rounded-lg hover:bg-green-700 transition-colors">
                Train Ai
            </button>
            <a onClick={()=>setTab('onetimecall')} href='#OneTimeCall'>
              <button className="mt-6 px-4 py-2 bg-main-color font-bold text-white rounded-lg hover:bg-green-700 transition-colors">
                One-time Call
            </button>
            </a> */}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
