// Subscription for paginated data - only subscribe to visible records
export const SubscribeRegistrationTracking = `
  subscription SubscribeRegistrationTracking($where: dmaas_pendaftaran_bool_exp!, $order_by: [dmaas_pendaftaran_order_by!], $limit: Int, $offset: Int) {
    dmaas {
      pendaftaran(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
        id
        no_perjanjian
        debitur {
          id
          nama
        }
        notaris {
          id
          nama
        }
        no_akta
        tgl_akta
        status {
          id
          nama
        }
        modified_date
      }
    }
  }
`;

// Query for initial data load (faster than subscription)
export const GetRegistrationTrackingData = `
  query GetRegistrationTrackingData($where: dmaas_pendaftaran_bool_exp!, $order_by: [dmaas_pendaftaran_order_by!], $limit: Int, $offset: Int) {
    dmaas {
      pendaftaran(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
        id
        no_perjanjian
        debitur {
          id
          nama
        }
        notaris {
          id
          nama
        }
        no_akta
        tgl_akta
        status {
          id
          nama
        }
        modified_date
      }
      pendaftaran_aggregate(where: $where) {
        aggregate {
          count
        }
      }
    }
  }
`;

// Lightweight subscription for status change notifications only
export const SubscribeStatusChanges = `
  subscription SubscribeStatusChanges($where: dmaas_pendaftaran_bool_exp!) {
    dmaas {
      pendaftaran(where: $where, order_by: { modified_date: desc }, limit: 1) {
        id
        no_perjanjian
        status {
          id
          nama
        }
        modified_date
      }
    }
  }
`;

// Get counts by status for dashboard
export const GetStatusCounts = `
  query GetStatusCounts {
    dmaas {
      unassigned: pendaftaran_aggregate(where: { status: { nama: { _eq: "Unassigned" } } }) {
        aggregate { count }
      }
      queued: pendaftaran_aggregate(where: { status: { nama: { _eq: "Assigned" } } }) {
        aggregate { count }
      }
      submitting: pendaftaran_aggregate(where: { status: { nama: { _eq: "Submitting" } } }) {
        aggregate { count }
      }
      waiting_payment: pendaftaran_aggregate(where: { status: { nama: { _eq: "Waiting Payment" } } }) {
        aggregate { count }
      }
      completed: pendaftaran_aggregate(where: { status: { nama: { _eq: "Completed" } } }) {
        aggregate { count }
      }
      failed: pendaftaran_aggregate(where: { status: { nama: { _eq: "Failed" } } }) {
        aggregate { count }
      }
    }
  }
`;
 