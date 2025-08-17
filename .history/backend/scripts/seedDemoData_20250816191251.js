
    // --- In ra terminal ---
    console.log(`>>> Seed thành công: ${doctors.length} bác sĩ, ${patients.length} bệnh nhân, ${appointments.length} lịch hẹn.`);
    
    console.log('--- Danh sách bác sĩ ---');
    doctors.forEach(d => console.log(`${d.user.fullName} | Email: ${d.user.email}`));

    console.log('--- Danh sách bệnh nhân ---');
    patients.forEach(p => console.log(`${p.fullName} | Email: ${p.email}`));

    console.log(`--- Tổng số lịch hẹn: ${appointments.length} ---`);

    process.exit(0);

  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
}

seedDemoData();
