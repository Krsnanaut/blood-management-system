document.addEventListener('DOMContentLoaded', function() {
    // Initialize any JavaScript functionality here
    
    // For example, automatically hide alert messages after 5 seconds
    const alertMessages = document.querySelectorAll('.alert');
    if (alertMessages.length > 0) {
      setTimeout(function() {
        alertMessages.forEach(function(alert) {
          alert.style.display = 'none';
        });
      }, 5000);
    }
    
    // Set active blood type in forms if user is logged in
    const userBloodType = document.getElementById('user-blood-type');
    const bloodTypeSelect = document.getElementById('bloodType');
    
    if (userBloodType && bloodTypeSelect) {
      const bloodType = userBloodType.value;
      if (bloodType) {
        bloodTypeSelect.value = bloodType;
      }
    }
  });
  
  // Example function to confirm deletion
  function confirmDelete(id, type) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      document.getElementById(`delete-form-${id}`).submit();
    }
  }
  