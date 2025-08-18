useEffect(() => {
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/doctor/dashboard');
      console.log('--- Dashboard API response ---', res.data);

      const todayAppts = Array.isArray(res.data.todayAppointments)
        ? res.data.todayAppointments
        : [];
      console.log('--- Today Appointments (FE) ---', todayAppts);

      setTodayAppointments(todayAppts);
      setWeeklyAppointmentsCount(res.data.weeklyAppointmentsCount || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err.response || err);
      setError('Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);
