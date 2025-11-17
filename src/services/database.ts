import { supabase } from '@/integrations/supabase/client';
import { User, Leader, Manager, Foreman, Worker, Evaluation } from '@/types';
import { reminderService } from './reminderService';

export const dbService = {
  // User operations
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as 'admin' | 'leader' | 'manager' | 'foreman',
      entityId: user.entity_id || '',
      isActive: user.is_active,
      isPending: user.is_pending || false,
      status: (user.status || 'pending') as 'pending' | 'approved' | 'disabled',
      createdAt: new Date(user.created_at)
    }));
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email.toLowerCase(), // Ensure lowercase email
        password: user.password,
        role: user.role,
        entity_id: user.entityId,
        is_active: false, // New users start inactive
        is_pending: true,
        status: 'pending' // Default to pending approval
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as 'admin' | 'leader' | 'manager' | 'foreman',
      entityId: data.entity_id || '',
      isActive: data.is_active,
      isPending: data.is_pending || false,
      status: (data.status || 'pending') as 'pending' | 'approved' | 'disabled',
      createdAt: new Date(data.created_at)
    };
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email.toLowerCase() }),
        ...(updates.password && { password: updates.password }),
        ...(updates.role && { role: updates.role }),
        ...(updates.entityId !== undefined && { entity_id: updates.entityId }),
        ...(updates.isActive !== undefined && { is_active: updates.isActive }),
        ...(updates.isPending !== undefined && { is_pending: updates.isPending }),
        ...(updates.status && { status: updates.status })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as 'admin' | 'leader' | 'manager' | 'foreman',
      entityId: data.entity_id || '',
      isActive: data.is_active,
      isPending: data.is_pending || false,
      status: (data.status || 'pending') as 'pending' | 'approved' | 'disabled',
      createdAt: new Date(data.created_at)
    };
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // New method to find user by email (case-insensitive)
  async findUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as 'admin' | 'leader' | 'manager' | 'foreman',
      entityId: data.entity_id || '',
      isActive: data.is_active,
      isPending: data.is_pending || false,
      status: (data.status || 'pending') as 'pending' | 'approved' | 'disabled',
      createdAt: new Date(data.created_at)
    };
  },

  // New method to link user to existing entity by name and email
  async linkUserToExistingEntity(userId: string, userEmail: string, userName: string) {
    // Try to find existing foreman, manager, or leader by name
    const [foremenData, managersData, leadersData] = await Promise.all([
      this.getForemen(),
      this.getManagers(),
      this.getLeaders()
    ]);

    let entityId = '';
    let role: 'leader' | 'manager' | 'foreman' = 'foreman';

    // Check if user matches existing foreman
    const matchingForeman = foremenData.find(f => 
      f.name.toLowerCase() === userName.toLowerCase()
    );
    
    if (matchingForeman) {
      entityId = matchingForeman.id;
      role = 'foreman';
    } else {
      // Check if user matches existing manager
      const matchingManager = managersData.find(m => 
        m.name.toLowerCase() === userName.toLowerCase()
      );
      
      if (matchingManager) {
        entityId = matchingManager.id;
        role = 'manager';
      } else {
        // Check if user matches existing leader
        const matchingLeader = leadersData.find(l => 
          l.name.toLowerCase() === userName.toLowerCase()
        );
        
        if (matchingLeader) {
          entityId = matchingLeader.id;
          role = 'leader';
        }
      }
    }

    // Update user with found entity mapping
    if (entityId) {
      await this.updateUser(userId, {
        role,
        entityId,
        isActive: true,
        isPending: false,
        status: 'approved'
      });
    }

    return { entityId, role };
  },

  // Leaders operations
  async getLeaders() {
    const { data, error } = await supabase
      .from('leaders')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data.map(leader => ({
      id: leader.id,
      name: leader.name,
      createdAt: new Date(leader.created_at)
    }));
  },

  async createLeader(leader: Omit<Leader, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('leaders')
      .insert({ name: leader.name })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at)
    };
  },

  async updateLeader(id: string, updates: Partial<Leader>) {
    const { data, error } = await supabase
      .from('leaders')
      .update({ name: updates.name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at)
    };
  },

  async deleteLeader(id: string) {
    const { error } = await supabase
      .from('leaders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Managers operations
  async getManagers() {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data.map(manager => ({
      id: manager.id,
      name: manager.name,
      leaderId: manager.leader_id,
      createdAt: new Date(manager.created_at)
    }));
  },

  async createManager(manager: Omit<Manager, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('managers')
      .insert({
        name: manager.name,
        leader_id: manager.leaderId
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      leaderId: data.leader_id,
      createdAt: new Date(data.created_at)
    };
  },

  async updateManager(id: string, updates: Partial<Manager>) {
    const { data, error } = await supabase
      .from('managers')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.leaderId !== undefined && { leader_id: updates.leaderId })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      leaderId: data.leader_id,
      createdAt: new Date(data.created_at)
    };
  },

  async deleteManager(id: string) {
    const { error } = await supabase
      .from('managers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Foremen operations
  async getForemen() {
    const { data, error } = await supabase
      .from('foremen')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data.map(foreman => ({
      id: foreman.id,
      name: foreman.name,
      managerId: foreman.manager_id,
      createdAt: new Date(foreman.created_at)
    }));
  },

  async createForeman(foreman: Omit<Foreman, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('foremen')
      .insert({
        name: foreman.name,
        manager_id: foreman.managerId
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      managerId: data.manager_id,
      createdAt: new Date(data.created_at)
    };
  },

  async updateForeman(id: string, updates: Partial<Foreman>) {
    const { data, error } = await supabase
      .from('foremen')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.managerId !== undefined && { manager_id: updates.managerId })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      managerId: data.manager_id,
      createdAt: new Date(data.created_at)
    };
  },

  async deleteForeman(id: string) {
    const { error } = await supabase
      .from('foremen')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Workers operations
  async getWorkers() {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data.map(worker => ({
      id: worker.id,
      name: worker.name,
      foremanId: worker.foreman_id,
      evaluations: [],
      createdAt: new Date(worker.created_at)
    }));
  },

  async createWorker(worker: Omit<Worker, 'id' | 'createdAt' | 'evaluations'>) {
    const { data, error } = await supabase
      .from('workers')
      .insert({
        name: worker.name,
        foreman_id: worker.foremanId
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      foremanId: data.foreman_id,
      evaluations: [],
      createdAt: new Date(data.created_at)
    };
  },

  async updateWorker(id: string, updates: Partial<Worker>) {
    const { data, error } = await supabase
      .from('workers')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.foremanId !== undefined && { foreman_id: updates.foremanId })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      foremanId: data.foreman_id,
      evaluations: [],
      createdAt: new Date(data.created_at)
    };
  },

  async deleteWorker(id: string) {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Evaluations operations
  async getEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('evaluation_date', { ascending: false });
    
    if (error) throw error;
    return data.map(evaluation => ({
      id: evaluation.id,
      workerId: evaluation.worker_id,
      foremanId: evaluation.foreman_id,
      evaluatorId: evaluation.evaluator_id,
      evaluatorRole: evaluation.evaluator_role as 'leader' | 'manager' | 'foreman',
      evaluateeType: evaluation.evaluatee_type as 'worker' | 'foreman',
      date: new Date(evaluation.evaluation_date),
      period: evaluation.period as 'biweekly',
      scores: evaluation.scores as {
        projectCompletion: number;
        qualityIssues: number;
        toolCare: number;
        equipmentEtiquette: number;
        nearMiss: number;
        incident: number;
        attendance: number;
        attitude: number;
        taskOwnership: number;
        customerInteraction: number;
        teamwork: number;
      },
      totalScore: evaluation.total_score,
      rating: evaluation.rating as 'A' | 'B' | 'C',
      notes: evaluation.notes,
      biweeklyPeriod: evaluation.biweekly_period
    }));
  },

  async createEvaluation(evaluation: Omit<Evaluation, 'id'>) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        worker_id: evaluation.workerId,
        foreman_id: evaluation.foremanId,
        evaluator_id: evaluation.evaluatorId,
        evaluator_role: evaluation.evaluatorRole,
        evaluatee_type: evaluation.evaluateeType,
        evaluation_date: evaluation.date.toISOString(),
        period: evaluation.period,
        scores: evaluation.scores,
        total_score: evaluation.totalScore,
        rating: evaluation.rating,
        notes: evaluation.notes,
        biweekly_period: evaluation.biweeklyPeriod
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      workerId: data.worker_id,
      foremanId: data.foreman_id,
      evaluatorId: data.evaluator_id,
      evaluatorRole: data.evaluator_role as 'leader' | 'manager' | 'foreman',
      evaluateeType: data.evaluatee_type as 'worker' | 'foreman',
      date: new Date(data.evaluation_date),
      period: data.period as 'biweekly',
      scores: data.scores as {
        projectCompletion: number;
        qualityIssues: number;
        toolCare: number;
        equipmentEtiquette: number;
        nearMiss: number;
        incident: number;
        attendance: number;
        attitude: number;
        taskOwnership: number;
        customerInteraction: number;
        teamwork: number;
      },
      totalScore: data.total_score,
      rating: data.rating as 'A' | 'B' | 'C',
      notes: data.notes,
      biweeklyPeriod: data.biweekly_period
    };
  },

  async updateEvaluation(id: string, updates: Partial<Evaluation>) {
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        ...(updates.workerId && { worker_id: updates.workerId }),
        ...(updates.foremanId && { foreman_id: updates.foremanId }),
        ...(updates.evaluatorId && { evaluator_id: updates.evaluatorId }),
        ...(updates.evaluatorRole && { evaluator_role: updates.evaluatorRole }),
        ...(updates.evaluateeType && { evaluatee_type: updates.evaluateeType }),
        ...(updates.date && { evaluation_date: updates.date.toISOString() }),
        ...(updates.period && { period: updates.period }),
        ...(updates.scores && { scores: updates.scores }),
        ...(updates.totalScore !== undefined && { total_score: updates.totalScore }),
        ...(updates.rating && { rating: updates.rating }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.biweeklyPeriod !== undefined && { biweekly_period: updates.biweeklyPeriod })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      workerId: data.worker_id,
      foremanId: data.foreman_id,
      evaluatorId: data.evaluator_id,
      evaluatorRole: data.evaluator_role as 'leader' | 'manager' | 'foreman',
      evaluateeType: data.evaluatee_type as 'worker' | 'foreman',
      date: new Date(data.evaluation_date),
      period: data.period as 'biweekly',
      scores: data.scores as {
        projectCompletion: number;
        qualityIssues: number;
        toolCare: number;
        equipmentEtiquette: number;
        nearMiss: number;
        incident: number;
        attendance: number;
        attitude: number;
        taskOwnership: number;
        customerInteraction: number;
        teamwork: number;
      },
      totalScore: data.total_score,
      rating: data.rating as 'A' | 'B' | 'C',
      notes: data.notes,
      biweeklyPeriod: data.biweekly_period
    };
  },

  async deleteEvaluation(id: string) {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // New method to get organizational hierarchy
  async getOrganizationalHierarchy() {
    try {
      const [leadersData, managersData, foremenData, workersData] = await Promise.all([
        this.getLeaders(),
        this.getManagers(),
        this.getForemen(),
        this.getWorkers()
      ]);

      // Build the hierarchy structure
      const hierarchy = leadersData.map(leader => {
        const leadersManagers = managersData.filter(m => m.leaderId === leader.id);
        const directForemen = foremenData.filter(f => !f.managerId); // Brian's direct foremen
        
        return {
          ...leader,
          type: 'leader' as const,
          managers: leadersManagers.map(manager => ({
            ...manager,
            type: 'manager' as const,
            foremen: foremenData.filter(f => f.managerId === manager.id).map(foreman => ({
              ...foreman,
              type: 'foreman' as const,
              workers: workersData.filter(w => w.foremanId === foreman.id)
            }))
          })),
          // For Brian - direct foremen without managers
          directForemen: leader.name === 'Brian' ? directForemen.map(foreman => ({
            ...foreman,
            type: 'foreman' as const,
            workers: workersData.filter(w => w.foremanId === foreman.id)
          })) : []
        };
      });

      return hierarchy;
    } catch (error) {
      console.error('Error building organizational hierarchy:', error);
      throw error;
    }
  },

  // Add reminder service methods
  reminder: reminderService
};
