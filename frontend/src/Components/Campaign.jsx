import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

const Campaign = ({ googleId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [formData, setFormData] = useState({
    campaignName: '',
    goal: '',
    personality: 'Professional',
    script: '',
    language: 'English (US)',
    voice: 'Joanna'
  });

  // Predefined options
  const Personalities = ["Friendly", "Professional", "Witty", "Empathetic"];
  
  // Language and Voice mapping
  const LanguageVoices = {
    "English (US)": [
      { name: "Joanna", gender: "Female" },
      { name: "Matthew", gender: "Male" },
      { name: "Ivy", gender: "Female" },
      { name: "Justin", gender: "Male" },
      { name: "Kendra", gender: "Female" },
      { name: "Kimberly", gender: "Female" },
      { name: "Salli", gender: "Female" },
      { name: "Joey", gender: "Male" },
    ],
    "English (Indian)": [
      { name: "Aditi", gender: "Female" },
      { name: "Raveena", gender: "Female" },
    ],
    "Hindi": [
      { name: "Kajal", gender: "Female" },
    ],
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_URL}/campaign/user/${googleId}`);
      setCampaigns(response.data.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
    if (googleId) {
      fetchCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleId]);

  // Auto-refresh campaigns every 5 seconds if there's a running campaign
  useEffect(() => {
    const hasRunningCampaign = campaigns.some(c => c.status === 'running');
    
    if (hasRunningCampaign && googleId) {
      const interval = setInterval(() => {
        fetchCampaigns();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns, googleId]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const contacts = [];

      // Skip header row and parse data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [name, phoneNumber] = line.split(',').map(item => item.trim());
          if (name && phoneNumber) {
            contacts.push({ name, phoneNumber });
          }
        }
      }

      setCsvData(contacts);
    };

    reader.readAsText(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'language') {
      setFormData(prev => ({ ...prev, [name]: value, voice: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (csvData.length === 0) {
      alert('Please upload a CSV file with contacts or click "Try Example"');
      return;
    }

    if (!formData.voice) {
      alert('Please select a voice');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        googleId,
        campaignName: formData.campaignName,
        goal: formData.goal,
        personality: formData.personality,
        script: formData.script,
        language: formData.language,
        voice: formData.voice,
        contacts: csvData
      };

      await axios.post(`${API_URL}/campaign/create`, payload);
      alert('Campaign created successfully!');
      setShowCreateForm(false);
      setFormData({
        campaignName: '',
        goal: '',
        personality: 'Professional',
        script: '',
        language: 'English (US)',
        voice: 'Joanna'
      });
      setCsvData([]);
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await axios.delete(`${API_URL}/campaign/${campaignId}`);
      alert('Campaign deleted successfully!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const handleStartCampaign = async (campaignId) => {
    if (!confirm('Start this campaign? Calls will be made to all contacts.')) return;

    try {
      const response = await axios.post(`${API_URL}/campaign/${campaignId}/execute`);
      alert(response.data.message);
      fetchCampaigns();
    } catch (error) {
      console.error('Error starting campaign:', error);
      alert(error.response?.data?.error || 'Failed to start campaign');
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      const response = await axios.post(`${API_URL}/campaign/${campaignId}/pause`);
      alert(response.data.message);
      fetchCampaigns();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      alert(error.response?.data?.error || 'Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId) => {
    try {
      const response = await axios.post(`${API_URL}/campaign/${campaignId}/resume`);
      alert(response.data.message);
      fetchCampaigns();
    } catch (error) {
      console.error('Error resuming campaign:', error);
      alert(error.response?.data?.error || 'Failed to resume campaign');
    }
  };

  const handleTryExample = () => {
    // Example campaign data
    const exampleData = {
      campaignName: 'Black Friday Sale Campaign',
      goal: 'Promotional Call',
      personality: 'Friendly',
      script: `Hi! This is a quick call to inform you about our amazing Black Friday sale happening now. We're offering up to 70% off on all products. 

This is a limited-time offer valid only for the next 48 hours. Would you be interested in checking out our deals?

Thank you for your time and happy shopping!`,
      language: 'English (US)',
      voice: 'Joanna'
    };

    // Example CSV data
    const exampleContacts = [
      { name: 'Aaditya Sahani', phoneNumber: '+918108571125' },
      { name: 'John Doe', phoneNumber: '+1234567890' },
      { name: 'Jane Smith', phoneNumber: '+1987654321' },
      { name: 'Rahul Kumar', phoneNumber: '+919876543210' },
      { name: 'Priya Sharma', phoneNumber: '+919123456789' }
    ];

    setFormData(exampleData);
    setCsvData(exampleContacts);
    setShowCreateForm(true);
  };

  const getAvailableVoices = () => {
    return LanguageVoices[formData.language] || [];
  };

  return (
    <section id='Campaign' className='justify-center items-center flex flex-col min-h-screen px-4 sm:px-6 md:px-12 lg:px-[10vw] py-8 overflow-auto'>
      <div className='w-full max-w-6xl'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-white text-3xl sm:text-4xl font-semibold'>Campaigns</h1>
          <div className='flex gap-3'>
            <button
              onClick={handleTryExample}
              className='bg-transparent border-2 border-[#38E07A] text-[#38E07A] font-semibold px-6 py-2 rounded-lg hover:bg-[#38E07A] hover:text-[#122117] transition'
            >
              Try Example
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='bg-[#38E07A] text-[#122117] font-semibold px-6 py-2 rounded-lg hover:bg-[#2bc465] transition'
            >
              {showCreateForm ? 'Cancel' : 'Create Campaign'}
            </button>
          </div>
        </div>

        {/* Create Campaign Form */}
        {showCreateForm && (
          <div className='bg-[#264533] border-2 border-[#38E07A] rounded-lg p-6 mb-8'>
            <h2 className='text-white text-2xl font-semibold mb-4'>Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign} className='space-y-4'>
              {/* Campaign Name */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>Campaign Name *</label>
                <input
                  type='text'
                  name='campaignName'
                  value={formData.campaignName}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent'
                  placeholder='Black Friday Sale Campaign'
                />
              </div>

              {/* CSV Upload */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>Upload Contacts CSV *</label>
                <input
                  type='file'
                  accept='.csv'
                  onChange={handleCSVUpload}
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#38E07A] file:text-[#122117] hover:file:bg-[#2bc465]'
                />
                <p className='text-xs text-gray-400 mt-1'>
                  CSV format: name, phoneNumber (e.g., "John Doe, +1234567890")
                </p>
                {csvData.length > 0 && (
                  <div className='mt-2 p-2 bg-[#122117] rounded border border-[#38E07A]'>
                    <p className='text-sm text-[#38E07A] font-semibold'>✓ {csvData.length} contacts loaded</p>
                    <div className='mt-1 max-h-32 overflow-y-auto'>
                      {csvData.slice(0, 5).map((contact, idx) => (
                        <p key={idx} className='text-xs text-gray-400'>
                          {idx + 1}. {contact.name} - {contact.phoneNumber}
                        </p>
                      ))}
                      {csvData.length > 5 && (
                        <p className='text-xs text-gray-500 mt-1'>
                          ... and {csvData.length - 5} more contacts
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Goal */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>Campaign Goal</label>
                <input
                  type='text'
                  name='goal'
                  value={formData.goal}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent'
                  placeholder='e.g., Product Launch Announcement'
                />
              </div>

              {/* Personality */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>AI Personality</label>
                <select
                  name='personality'
                  value={formData.personality}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent'
                >
                  {Personalities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>Language</label>
                <select
                  name='language'
                  value={formData.language}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent'
                >
                  {Object.keys(LanguageVoices).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Voice */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>Voice *</label>
                <select
                  name='voice'
                  value={formData.voice}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent'
                >
                  <option value=''>Select a voice</option>
                  {getAvailableVoices().map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* Script */}
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-1'>Custom Script (Optional)</label>
                <textarea
                  name='script'
                  value={formData.script}
                  onChange={handleChange}
                  rows='6'
                  className='w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent'
                  placeholder='Enter your custom script here...'
                />
                <p className='text-xs text-green-400 mt-1'>
                  💡 Tip: Write your script in English! If you select Hindi language, it will be automatically translated to Hindi (हिंदी) for the call.
                </p>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full bg-[#38E07A] text-[#122117] font-semibold py-3 rounded-lg hover:bg-[#2bc465] transition disabled:bg-gray-600 disabled:text-gray-400'
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
            </form>
          </div>
        )}

        {/* Campaigns List */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {campaigns.map(campaign => (
            <div key={campaign.campaignId} className='bg-[#264533] border-2 border-[#38E07A] rounded-lg p-6'>
              <h3 className='text-white text-xl font-semibold mb-2'>{campaign.campaignName}</h3>
              <div className='space-y-2 text-gray-300 text-sm mb-4'>
                <p><span className='text-[#38E07A]'>Goal:</span> {campaign.goal || 'N/A'}</p>
                <p><span className='text-[#38E07A]'>Personality:</span> {campaign.personality}</p>
                <p><span className='text-[#38E07A]'>Language:</span> {campaign.language}</p>
                <p><span className='text-[#38E07A]'>Voice:</span> {campaign.voice}</p>
                <p><span className='text-[#38E07A]'>Contacts:</span> {campaign.totalContacts}</p>
                <p><span className='text-[#38E07A]'>Completed:</span> {campaign.completedCalls}/{campaign.totalContacts}</p>
                
                {/* Progress Bar */}
                <div className='mt-2'>
                  <div className='flex justify-between text-xs text-gray-400 mb-1'>
                    <span>Progress</span>
                    <span>{Math.round((campaign.completedCalls / campaign.totalContacts) * 100)}%</span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div
                      className='bg-[#38E07A] h-2 rounded-full transition-all duration-500'
                      style={{ width: `${(campaign.completedCalls / campaign.totalContacts) * 100}%` }}
                    />
                  </div>
                </div>

                <p><span className='text-[#38E07A]'>Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                    campaign.status === 'completed' ? 'bg-green-600' :
                    campaign.status === 'running' ? 'bg-blue-600' :
                    campaign.status === 'paused' ? 'bg-yellow-600' :
                    'bg-gray-600'
                  }`}>
                    {campaign.status}
                    {campaign.status === 'running' && ' 🔄'}
                  </span>
                </p>
              </div>
              <div className='flex flex-col gap-2'>
                {/* Start button - only show for pending campaigns */}
                {campaign.status === 'pending' && (
                  <button
                    onClick={() => handleStartCampaign(campaign.campaignId)}
                    className='w-full bg-[#38E07A] text-[#122117] py-2 rounded-lg hover:bg-[#2bc465] transition text-sm font-semibold'
                  >
                    ▶ Start Campaign
                  </button>
                )}

                {/* Pause button - only show for running campaigns */}
                {campaign.status === 'running' && (
                  <button
                    onClick={() => handlePauseCampaign(campaign.campaignId)}
                    className='w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm font-semibold'
                  >
                    ⏸ Pause Campaign
                  </button>
                )}

                {/* Resume button - only show for paused campaigns */}
                {campaign.status === 'paused' && (
                  <button
                    onClick={() => handleResumeCampaign(campaign.campaignId)}
                    className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold'
                  >
                    ▶ Resume Campaign
                  </button>
                )}

                {/* Delete button - show for all except running */}
                {campaign.status !== 'running' && (
                  <button
                    onClick={() => handleDeleteCampaign(campaign.campaignId)}
                    className='w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold'
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && !showCreateForm && (
          <div className='text-center text-gray-400 mt-12'>
            <p className='text-xl'>No campaigns yet. Create your first campaign to get started!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Campaign;
