// Loyalty Program Management System
class LoyaltyManager {
    constructor() {
        this.points = 0;
        this.tier = 'bronze';
        this.transactions = [];
        this.rewards = [];
        this.isLoggedIn = false;
        this.userEmail = '';
        
        // Tier thresholds
        this.tiers = {
            bronze: { min: 0, max: 99, name: 'Bronce', multiplier: 1 },
            silver: { min: 100, max: 499, name: 'Plata', multiplier: 1.2 },
            gold: { min: 500, max: Infinity, name: 'Oro', multiplier: 1.5 }
        };
        
        // Available rewards
        this.availableRewards = [
            {
                id: 1,
                name: {
                    es: 'Descuento 5%',
                    eu: '%5 Deskontua',
                    en: '5% Discount'
                },
                description: {
                    es: 'Descuento del 5% en tu próxima compra',
                    eu: 'Hurrengo erosketaren %5eko deskontua',
                    en: '5% discount on your next purchase'
                },
                cost: 50,
                type: 'discount',
                value: 0.05,
                minTier: 'bronze'
            },
            {
                id: 2,
                name: {
                    es: 'Descuento 10%',
                    eu: '%10 Deskontua',
                    en: '10% Discount'
                },
                description: {
                    es: 'Descuento del 10% en tu próxima compra',
                    eu: 'Hurrengo erosketaren %10eko deskontua',
                    en: '10% discount on your next purchase'
                },
                cost: 100,
                type: 'discount',
                value: 0.10,
                minTier: 'silver'
            },
            {
                id: 3,
                name: {
                    es: 'Consulta Gratuita',
                    eu: 'Kontsulta Doakoa',
                    en: 'Free Consultation'
                },
                description: {
                    es: 'Consulta farmacéutica gratuita de 30 minutos',
                    eu: '30 minutuko farmazia kontsulta doakoa',
                    en: 'Free 30-minute pharmaceutical consultation'
                },
                cost: 150,
                type: 'service',
                value: 'consultation',
                minTier: 'silver'
            },
            {
                id: 4,
                name: {
                    es: 'Envío Gratuito',
                    eu: 'Bidalketa Doakoa',
                    en: 'Free Shipping'
                },
                description: {
                    es: 'Envío gratuito en tu próximo pedido',
                    eu: 'Hurrengo eskaeran bidalketa doakoa',
                    en: 'Free shipping on your next order'
                },
                cost: 75,
                type: 'shipping',
                value: 'free',
                minTier: 'bronze'
            },
            {
                id: 5,
                name: {
                    es: 'Descuento Premium 20%',
                    eu: 'Premium %20 Deskontua',
                    en: 'Premium 20% Discount'
                },
                description: {
                    es: 'Descuento del 20% en productos premium',
                    eu: 'Premium produktuetan %20ko deskontua',
                    en: '20% discount on premium products'
                },
                cost: 300,
                type: 'discount',
                value: 0.20,
                minTier: 'gold'
            }
        ];
        
        this.loadLoyaltyData();
    }

    // Load loyalty data from localStorage
    loadLoyaltyData() {
        const savedData = localStorage.getItem('pharmacy-loyalty');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.points = data.points || 0;
                this.tier = data.tier || 'bronze';
                this.transactions = data.transactions || [];
                this.rewards = data.rewards || [];
                this.isLoggedIn = data.isLoggedIn || false;
                this.userEmail = data.userEmail || '';
            } catch (e) {
                console.error('Error loading loyalty data:', e);
                this.resetLoyaltyData();
            }
        }
        this.updateTier();
        this.updateDisplay();
    }

    // Save loyalty data to localStorage
    saveLoyaltyData() {
        const data = {
            points: this.points,
            tier: this.tier,
            transactions: this.transactions,
            rewards: this.rewards,
            isLoggedIn: this.isLoggedIn,
            userEmail: this.userEmail
        };
        localStorage.setItem('pharmacy-loyalty', JSON.stringify(data));
    }

    // Reset loyalty data
    resetLoyaltyData() {
        this.points = 0;
        this.tier = 'bronze';
        this.transactions = [];
        this.rewards = [];
        this.isLoggedIn = false;
        this.userEmail = '';
        this.saveLoyaltyData();
        this.updateDisplay();
    }

    // Add points to user account
    addPoints(amount, description = 'Purchase') {
        if (!this.isLoggedIn) {
            // Store pending points for when user logs in
            this.storePendingPoints(amount, description);
            return;
        }

        const multiplier = this.tiers[this.tier].multiplier;
        const pointsToAdd = Math.floor(amount * multiplier);
        
        this.points += pointsToAdd;
        
        // Record transaction
        this.transactions.push({
            id: this.generateTransactionId(),
            type: 'earned',
            amount: pointsToAdd,
            description: description,
            date: new Date().toISOString(),
            multiplier: multiplier
        });

        const oldTier = this.tier;
        this.updateTier();
        
        // Check for tier upgrade
        if (oldTier !== this.tier) {
            this.showTierUpgradeNotification(oldTier, this.tier);
        }

        this.saveLoyaltyData();
        this.updateDisplay();
        this.showPointsEarnedNotification(pointsToAdd);

        return pointsToAdd;
    }

    // Spend points on rewards
    spendPoints(rewardId) {
        const reward = this.availableRewards.find(r => r.id === rewardId);
        if (!reward) {
            throw new Error('Recompensa no encontrada');
        }

        if (this.points < reward.cost) {
            throw new Error('Puntos insuficientes');
        }

        if (!this.canAccessReward(reward)) {
            throw new Error('Nivel de fidelidad insuficiente');
        }

        this.points -= reward.cost;
        
        // Add reward to user's rewards
        const userReward = {
            id: this.generateRewardId(),
            rewardId: reward.id,
            name: reward.name,
            description: reward.description,
            type: reward.type,
            value: reward.value,
            dateEarned: new Date().toISOString(),
            dateExpires: this.calculateExpiryDate(),
            used: false
        };
        
        this.rewards.push(userReward);

        // Record transaction
        this.transactions.push({
            id: this.generateTransactionId(),
            type: 'spent',
            amount: reward.cost,
            description: `Recompensa: ${reward.name[window.translations?.getCurrentLanguage() || 'es']}`,
            date: new Date().toISOString(),
            rewardId: userReward.id
        });

        this.saveLoyaltyData();
        this.updateDisplay();
        this.showRewardEarnedNotification(reward);

        return userReward;
    }

    // Check if user can access a reward based on tier
    canAccessReward(reward) {
        const tierOrder = ['bronze', 'silver', 'gold'];
        const userTierIndex = tierOrder.indexOf(this.tier);
        const requiredTierIndex = tierOrder.indexOf(reward.minTier);
        return userTierIndex >= requiredTierIndex;
    }

    // Update user tier based on points
    updateTier() {
        let newTier = 'bronze';
        
        for (const [tierName, tierData] of Object.entries(this.tiers)) {
            if (this.points >= tierData.min && this.points <= tierData.max) {
                newTier = tierName;
                break;
            }
        }
        
        this.tier = newTier;
    }

    // Get progress to next tier
    getTierProgress() {
        const currentTier = this.tiers[this.tier];
        if (currentTier.max === Infinity) {
            return { percentage: 100, pointsToNext: 0, nextTier: null };
        }

        const pointsInTier = this.points - currentTier.min;
        const tierRange = currentTier.max - currentTier.min + 1;
        const percentage = Math.min((pointsInTier / tierRange) * 100, 100);
        const pointsToNext = currentTier.max + 1 - this.points;
        
        const nextTierName = this.tier === 'bronze' ? 'silver' : 'gold';
        
        return {
            percentage: Math.round(percentage),
            pointsToNext: Math.max(pointsToNext, 0),
            nextTier: nextTierName
        };
    }

    // Get available rewards for current tier
    getAvailableRewards() {
        return this.availableRewards.filter(reward => 
            this.canAccessReward(reward) && this.points >= reward.cost
        );
    }

    // Get user's active rewards
    getActiveRewards() {
        const now = new Date();
        return this.rewards.filter(reward => 
            !reward.used && new Date(reward.dateExpires) > now
        );
    }

    // Use a reward
    useReward(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) {
            throw new Error('Recompensa no encontrada');
        }

        if (reward.used) {
            throw new Error('Recompensa ya utilizada');
        }

        if (new Date(reward.dateExpires) <= new Date()) {
            throw new Error('Recompensa expirada');
        }

        reward.used = true;
        reward.dateUsed = new Date().toISOString();

        this.saveLoyaltyData();
        return reward;
    }

    // Store pending points for non-logged-in users
    storePendingPoints(amount, description) {
        const pendingPoints = JSON.parse(localStorage.getItem('pharmacy-pending-points') || '[]');
        pendingPoints.push({
            amount: amount,
            description: description,
            date: new Date().toISOString()
        });
        localStorage.setItem('pharmacy-pending-points', JSON.stringify(pendingPoints));
    }

    // Apply pending points when user logs in
    applyPendingPoints() {
        const pendingPoints = JSON.parse(localStorage.getItem('pharmacy-pending-points') || '[]');
        let totalPoints = 0;

        pendingPoints.forEach(pending => {
            totalPoints += this.addPoints(pending.amount, pending.description);
        });

        // Clear pending points
        localStorage.removeItem('pharmacy-pending-points');

        if (totalPoints > 0) {
            this.showNotification('success', `¡Has ganado ${totalPoints} puntos de tus compras anteriores!`);
        }
    }

    // User login
    login(email) {
        this.isLoggedIn = true;
        this.userEmail = email;
        this.saveLoyaltyData();
        this.updateDisplay();
        this.applyPendingPoints();
    }

    // User logout
    logout() {
        this.isLoggedIn = false;
        this.userEmail = '';
        this.saveLoyaltyData();
        this.updateDisplay();
    }

    // Update loyalty display in UI
    updateDisplay() {
        const loyaltyStatus = document.getElementById('user-loyalty-status');
        const userPoints = document.getElementById('user-points');
        const userTier = document.getElementById('user-tier');
        const loyaltyProgress = document.getElementById('loyalty-progress');

        if (!this.isLoggedIn) {
            if (loyaltyStatus) loyaltyStatus.style.display = 'none';
            return;
        }

        if (loyaltyStatus) loyaltyStatus.style.display = 'block';
        if (userPoints) userPoints.textContent = this.points.toString();
        if (userTier) userTier.textContent = this.tiers[this.tier].name;
        
        if (loyaltyProgress) {
            const progress = this.getTierProgress();
            loyaltyProgress.style.width = `${progress.percentage}%`;
        }
    }

    // Generate unique transaction ID
    generateTransactionId() {
        return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    // Generate unique reward ID
    generateRewardId() {
        return `RWD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    // Calculate reward expiry date (30 days from now)
    calculateExpiryDate() {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        return expiryDate.toISOString();
    }

    // Show points earned notification
    showPointsEarnedNotification(points) {
        const message = `¡Has ganado ${points} puntos!`;
        this.showNotification('success', message);
    }

    // Show tier upgrade notification
    showTierUpgradeNotification(oldTier, newTier) {
        const tierNames = {
            bronze: 'Bronce',
            silver: 'Plata',
            gold: 'Oro'
        };
        const message = `¡Felicidades! Has subido de ${tierNames[oldTier]} a ${tierNames[newTier]}!`;
        this.showNotification('success', message);
    }

    // Show reward earned notification
    showRewardEarnedNotification(reward) {
        const currentLang = window.translations?.getCurrentLanguage() || 'es';
        const message = `¡Has obtenido: ${reward.name[currentLang]}!`;
        this.showNotification('success', message);
    }

    // Show notification (uses the same system as cart.js)
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Get loyalty statistics
    getStatistics() {
        const totalEarned = this.transactions
            .filter(t => t.type === 'earned')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalSpent = this.transactions
            .filter(t => t.type === 'spent')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            currentPoints: this.points,
            currentTier: this.tier,
            totalEarned: totalEarned,
            totalSpent: totalSpent,
            activeRewards: this.getActiveRewards().length,
            transactionCount: this.transactions.length
        };
    }

    // Open loyalty rewards modal
    openRewardsModal() {
        let modal = document.getElementById('loyalty-rewards-modal');
        
        if (!modal) {
            modal = this.createRewardsModal();
        }

        this.renderRewards();
        modal.classList.add('active');
    }

    // Create loyalty rewards modal
    createRewardsModal() {
        const modal = document.createElement('div');
        modal.id = 'loyalty-rewards-modal';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Recompensas de Fidelidad</h3>
                    <button class="modal-close" onclick="closeModal('loyalty-rewards-modal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="loyalty-summary">
                        <div class="points-display">
                            <i class="fas fa-star"></i>
                            <span>${this.points} puntos disponibles</span>
                        </div>
                        <div class="tier-display">
                            Nivel: ${this.tiers[this.tier].name}
                        </div>
                    </div>
                    <div id="rewards-list" class="rewards-list">
                        <!-- Rewards will be rendered here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Render rewards in modal
    renderRewards() {
        const rewardsList = document.getElementById('rewards-list');
        if (!rewardsList) return;

        const currentLang = window.translations?.getCurrentLanguage() || 'es';
        
        const availableRewards = this.availableRewards.filter(reward => 
            this.canAccessReward(reward)
        );

        if (availableRewards.length === 0) {
            rewardsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-gift"></i>
                    <h3>No hay recompensas disponibles</h3>
                    <p>Sigue comprando para desbloquear recompensas</p>
                </div>
            `;
            return;
        }

        rewardsList.innerHTML = availableRewards.map(reward => {
            const canAfford = this.points >= reward.cost;
            
            return `
                <div class="reward-card ${!canAfford ? 'disabled' : ''}">
                    <div class="reward-info">
                        <h4>${reward.name[currentLang]}</h4>
                        <p>${reward.description[currentLang]}</p>
                        <div class="reward-cost">
                            <i class="fas fa-star"></i>
                            ${reward.cost} puntos
                        </div>
                    </div>
                    <button class="btn ${canAfford ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="loyaltyManager.redeemReward(${reward.id})"
                            ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Canjear' : 'Puntos insuficientes'}
                    </button>
                </div>
            `;
        }).join('');
    }

    // Redeem a reward
    redeemReward(rewardId) {
        try {
            const userReward = this.spendPoints(rewardId);
            this.renderRewards(); // Update the display
            
            // Close modal and show success
            closeModal('loyalty-rewards-modal');
            
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }
}

// Initialize loyalty manager
const loyaltyManager = new LoyaltyManager();

// Global functions
function openLoyaltyRewards() {
    if (!loyaltyManager.isLoggedIn) {
        loyaltyManager.showNotification('warning', 'Inicia sesión para ver tus recompensas');
        return;
    }
    loyaltyManager.openRewardsModal();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Export for use in other modules
window.loyaltyManager = loyaltyManager;